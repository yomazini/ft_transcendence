# Nginx reverse proxy with ModSecurity3 (OWASP Core Rule Set) in front of
# gateway-svc. Owner: Madani.
FROM owasp/modsecurity-crs:nginx
# The base image already runs as the non-root `nginx` user and renders every
# file in /etc/nginx/templates/ at start (envsubst). The config goes in as a
# template; no root/chown step is needed (and it breaks rootless Docker).
COPY conf/nginx.conf /etc/nginx/templates/conf.d/default.conf.template

COPY --chown=nginx:nginx --chmod=444 certs/server.pem /etc/nginx/ssl/server.pem
COPY --chown=nginx:nginx --chmod=400 keys/server.key /etc/nginx/ssl/server.key

USER nginx
