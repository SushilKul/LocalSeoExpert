# Example Terraform configuration for AWS deployment
# This is a minimal example and should be expanded for production use

provider "aws" {
  region = "us-west-2"
}

# Database
resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "14"
  instance_class       = "db.t3.micro"
  db_name              = "localseoexpert"
  username             = "dbuser"
  password             = var.db_password
  parameter_group_name = "default.postgres14"
  skip_final_snapshot  = true
  publicly_accessible  = false
}

# App server
resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 AMI
  instance_type = "t3.micro"
  
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              
              # Set environment variables
              echo "DATABASE_URL=${aws_db_instance.postgres.endpoint}" >> /etc/environment
              echo "JWT_SECRET=${var.jwt_secret}" >> /etc/environment
              echo "NODE_ENV=production" >> /etc/environment
              
              # Pull and run the application container
              docker pull ${var.docker_image}
              docker run -d -p 80:5000 \
                -e DATABASE_URL=${aws_db_instance.postgres.endpoint} \
                -e JWT_SECRET=${var.jwt_secret} \
                -e NODE_ENV=production \
                ${var.docker_image}
              EOF
  
  tags = {
    Name = "LocalSEOExpert-AppServer"
  }
}

# Variables
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "docker_image" {
  description = "Docker image for the application"
  type        = string
  default     = "your-registry/localseoexpert:latest"
}

# Outputs
output "app_server_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "database_endpoint" {
  value = aws_db_instance.postgres.endpoint
  sensitive = true
}