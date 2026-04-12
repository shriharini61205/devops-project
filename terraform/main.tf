provider "aws" {
  region = "ap-southeast-1"  # Singapore
}

resource "aws_instance" "devops_server" {
  ami           = "ami-0df7a207adb9748c7"  # Amazon Linux 2 (Singapore)
  instance_type = "t3.micro"

  tags = {
    Name = "DevOps-Server"
  }
}