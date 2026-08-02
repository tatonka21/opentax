# Terraform for Oracle Cloud Always Free (Ampere A1 ARM64 VM)
#
#   cp terraform.tfvars.example terraform.tfvars
#   terraform init && terraform apply
#
# Creates VCN + subnet + security list (22/80/443), an A1.Flex instance
# (2 OCPU / 12 GB), and a 100 GB data volume. Runs Ubuntu 22.04 arm64.
