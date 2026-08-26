output "ec2_public_ip" {
  description = "The public IP address of the deployed EC2 instance."
  value       = aws_instance.borrowbox.public_ip
}

output "ec2_public_dns" {
  description = "The public DNS name of the deployed EC2 instance."
  value       = aws_instance.borrowbox.public_dns
}
