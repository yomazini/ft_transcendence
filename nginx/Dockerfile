# Nginx reverse proxy with ModSecurity3 (OWASP Core Rule Set) in front of
# gateway-svc. Owner: Madani.
FROM owasp/modsecurity-crs:nginx
# The base image already runs as the non-root `nginx` user and renders every
# file in /etc/nginx/templates/ at start (envsubst). The config goes in as a
# template; no root/chown step is needed (and it breaks rootless Docker).
COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template
USER nginx
