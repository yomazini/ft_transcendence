#!/bin/sh
set -eu
umask 077

mkdir -p /tmp/minio-vault
chmod 700 /tmp/minio-vault

cp /run/vault/login.json /tmp/minio-vault/login.json

chown -R 1001:1001 /tmp/minio-vault
chmod 700 /tmp/minio-vault
chmod 600 /tmp/minio-vault/login.json

mkdir -p /opt/bitnami/minio/tmp
chown -R 1001:1001 /opt/bitnami/minio/tmp
chmod 700 /opt/bitnami/minio/tmp

chown -R 1001:1001 /bitnami/minio/data

mkdir -p /tmp/minio-home/.mc
chown -R 1001:1001 /tmp/minio-home
chmod 700 /tmp/minio-home /tmp/minio-home/.mc

export HOME=/tmp/minio-home
export MC_CONFIG_DIR=/tmp/minio-home/.mc

mkdir -p /.mc
chown 1001:1001 /.mc
chmod 700 /.mc

exec gosu 1001:1001 /usr/local/bin/vault-entrypoint.sh "$@"