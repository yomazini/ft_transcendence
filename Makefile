# ft_transcendence — shortcuts for docker compose.
# Usage: make <target>    e.g. make up, make exec s=auth-svc

COMPOSE = docker compose
s ?=

.PHONY: up down clean cleardb exec logs ps re

## up: build the images and start every container in the background
up:
	$(COMPOSE) up -d --build

## down: stop and remove the containers and the network (data is kept)
down:
	$(COMPOSE) down

## clean: like down, and also delete every volume (database, redis, grafana, minio)
clean:
	$(COMPOSE) down -v
	rm -rf vault/creds vault/secret

## cleardb: empty the database only, then recreate the tables (other volumes are kept)
cleardb:
	$(COMPOSE) rm -sf postgres
	docker volume rm postgres_db
	$(COMPOSE) up -d postgres
	$(COMPOSE) restart reporting-svc  # reporting-svc runs the Prisma migrations at start

## exec: open a shell in one container: make exec s=auth-svc
exec:
	@test -n "$(s)" || (echo "usage: make exec s=<container>" && exit 1)
	docker exec -it $(s) sh

## logs: follow the logs of one container, or all of them: make logs s=auth-svc
logs:
	$(COMPOSE) logs -f $(s)

## ps: list the containers and their state
ps:
	$(COMPOSE) ps

## re: clean everything and start again
re: clean up
