provider "aws" {
  region = "ap-southeast-1"   # ✅ Singapore
}

/* ========================
   SECURITY GROUP
======================== */
resource "aws_security_group" "web_sg" {
  name = "web-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

/* ========================
   EC2 INSTANCE
======================== */
resource "aws_instance" "my_ec2" {
  ami           = "ami-0df7a207adb9748c7"   # ✅ Ubuntu (Singapore)
  instance_type = "t3.micro"
  key_name      = "login"      # 🔁 change this

  vpc_security_group_ids = [aws_security_group.web_sg.id]

  root_block_device {
    volume_size = 10   # ✅ 10GB volume
    volume_type = "gp2"
  }

  tags = {
    Name = "Ecommerce-Server"
  }
}

/* ========================
   OUTPUT
======================== */
output "public_ip" {
  value = aws_instance.my_ec2.public_ip
}