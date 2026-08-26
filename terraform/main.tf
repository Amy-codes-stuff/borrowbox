terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
# Region is parameterized to allow flexibility; credentials must be provided externally (e.g. AWS CLI, Env Vars)
provider "aws" {
  region = var.aws_region
}

# Dynamically lookup the latest Ubuntu 22.04 LTS AMI in the selected region
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  # Canonical
  owners = ["099720109477"]
}

# SSH Key Pair resource
# Creates a key pair in AWS using a public key provided locally. Do NOT store private key in repository.
resource "aws_key_pair" "borrowbox_key" {
  key_name   = var.ssh_key_name
  public_key = var.public_key
}

# Security Group to define access rules for the BorrowBox server.
# Uses default VPC automatically to avoid unnecessary networking infrastructure.
resource "aws_security_group" "borrowbox_sg" {
  name        = "borrowbox-sg"
  description = "Security group for BorrowBox EC2 instance"

  # 1. SSH access (restricted to specified IP / CIDR for safety)
  ingress {
    description = "Restricted SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # 2. HTTP access from anywhere (for production web traffic)
  ingress {
    description = "HTTP web traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 3. HTTPS access from anywhere (for secure production web traffic)
  ingress {
    description = "HTTPS secure web traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # 4. TEMPORARY application port for testing (to be removed when exposing through Port 80/443)
  ingress {
    description = "TEMPORARY - Express backend access for testing"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound rules - Allow all outbound traffic so instance can fetch updates and packages
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "borrowbox-security-group"
  }
}

# Single EC2 instance for deploying BorrowBox MERN stack
resource "aws_instance" "borrowbox" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.borrowbox_key.key_name

  vpc_security_group_ids = [aws_security_group.borrowbox_sg.id]

  # Root block device setup
  root_block_device {
    volume_size           = 8
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name = "borrowbox-server"
  }
}
