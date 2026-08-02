variable "region" {
  description = "Oracle Cloud region, e.g. us-ashburn-1"
  type        = string
}

variable "tenancy_ocid" {
  type = string
}

variable "user_ocid" {
  type = string
}

variable "compartment_ocid" {
  type = string
}

variable "api_key_fingerprint" {
  type = string
}

variable "api_key_path" {
  description = "Local path to the OCI API key PEM"
  type        = string
}

variable "ssh_public_key" {
  description = "Public SSH key authorized on the instance"
  type        = string
}

variable "image_ocid" {
  description = "Arm64 Ubuntu image OCID for your region; leave empty to auto-resolve"
  type        = string
  default     = ""
}

variable "instance_ocpus" {
  description = "Free tier: 2 OCPUs (max 4)"
  type        = number
  default     = 2
}

variable "instance_memory_gbs" {
  description = "Free tier: 12 GB RAM (max 24)"
  type        = number
  default     = 12
}

variable "data_volume_size_gbs" {
  description = "Free tier allows 200 GB total block storage"
  type        = number
  default     = 100
}

variable "vcn_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"
}
