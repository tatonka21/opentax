terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "oci" {
  region           = var.region
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.api_key_fingerprint
  private_key_path = var.api_key_path
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_core_images" "arm_ubuntu" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "random_string" "suffix" {
  length  = 6
  upper   = false
  numeric = true
  special = false
}

resource "oci_core_vcn" "opentax" {
  compartment_id = var.compartment_ocid
  cidr_block     = var.vcn_cidr
  display_name   = "opentax-vcn"
}

resource "oci_core_internet_gateway" "opentax" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.opentax.id
  display_name   = "opentax-igw"
}

resource "oci_core_route_table" "opentax" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.opentax.id
  display_name   = "opentax-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.opentax.id
  }
}

resource "oci_core_security_list" "opentax" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.opentax.id
  display_name   = "opentax-sl"

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = 22
      min = 22
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = 80
      min = 80
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = 443
      min = 443
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

resource "oci_core_subnet" "opentax" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.opentax.id
  cidr_block     = var.subnet_cidr
  display_name   = "opentax-subnet"
  route_table_id = oci_core_route_table.opentax.id
  security_list_ids = [
    oci_core_security_list.opentax.id,
  ]
}

resource "oci_core_instance" "opentax" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "opentax-${random_string.suffix.result}"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_gbs
  }

  source_details {
    source_type = "image"
    source_id   = var.image_ocid != "" ? var.image_ocid : data.oci_core_images.arm_ubuntu.images[0].id
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
  }

  create_vnic_details {
    subnet_id      = oci_core_subnet.opentax.id
    assign_public_ip = true
  }
}

resource "oci_core_volume" "opentax_data" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "opentax-data"
  size_in_gbs         = var.data_volume_size_gbs
}

resource "oci_core_volume_attachment" "opentax_data" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  instance_id         = oci_core_instance.opentax.id
  volume_id           = oci_core_volume.opentax_data.id
}
