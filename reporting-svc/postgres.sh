#!/bin/bash

export $(cat /app/.env | xargs)

exec docker-entrypoint.sh postgres
