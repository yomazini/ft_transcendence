COMPOSE = docker compose

CERT_DIR := nginx/cert
KEY := $(CERT_DIR)/server.key
CERT := $(CERT_DIR)/server.pem
s ?=



.PHONY: up down clean cleardb exec logs ps re

up: $(CERT)
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down -v
	rm -rf vault/creds vault/secret vault/audit

cleardb:
	$(COMPOSE) rm -sf postgres
	docker volume rm postgres_db
	$(COMPOSE) up -d postgres

exec:
	@test -n "$(s)" || (echo "usage: make exec s=<container>" && exit 1)
	docker exec -it $(s) sh

logs:
	$(COMPOSE) logs -f $(s)

ps:
	$(COMPOSE) ps

re: clean up

recover:
	sudo sh ./recover.sh

CERT_DIR := nginx/cert
KEY := $(CERT_DIR)/server.key
CERT := $(CERT_DIR)/server.pem

$(KEY):
	mkdir -p $(CERT_DIR)
	openssl genrsa -out $@ 2048
	chmod 644 $@

$(CERT): $(KEY)
	openssl req -x509 -new -nodes -key $< \
		-sha256 -days 365 \
		-out $@ \
		-subj "/CN=localhost" \
		-addext "subjectAltName=DNS:localhost,DNS:*.localhost"
	chmod 644 $@