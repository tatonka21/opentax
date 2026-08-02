output "instance_public_ip" {
  value       = oci_core_instance.opentax.public_ip
  description = "Public IP of the OpenTAX VM"
}

output "instance_id" {
  value = oci_core_instance.opentax.id
}
