variable "aws_region" {
  type        = string
  description = "The AWS region to deploy resources into."
  default     = "ap-south-1"
}

variable "instance_type" {
  type        = string
  description = "The EC2 instance type for the BorrowBox server."
  default     = "t3.micro"
}

variable "ssh_key_name" {
  type        = string
  description = "The name of the SSH key pair to create in AWS."
  default     = "borrowbox-deploy-key"
}

variable "public_key" {
  type        = string
  description = "The public SSH key corresponding to the private key used to access the EC2 instance."
}

variable "allowed_ssh_cidr" {
  type        = string
  description = "The CIDR block allowed to connect to the EC2 instance via SSH."
}
