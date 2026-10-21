ui = true

log_level = "info"

api_addr = "http://vault:8200"

disable_mlock = true

default_lease_ttl = "1h"
max_lease_ttl = "24h"

storage "file" {
	path = "/vault/data"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = true
}
