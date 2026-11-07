COMPOSE = docker compose
s ?=

.PHONY: up down clean cleardb exec logs ps re

up:
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