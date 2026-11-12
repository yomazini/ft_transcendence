# Nginx reverse proxy with ModSecurity3 (OWASP Core Rule Set) in front of
# gateway-svc. Owner: Madani.
FROM owasp/modsecurity-crs:4.25.2-nginx-202610180210-lts
# The base image already runs as the non-root `nginx` user and renders every
# file in /etc/nginx/templates/ at start (envsubst). The config goes in as a
# template; no root/chown step is needed (and it breaks rootless Docker).
COPY conf/nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY conf/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf /etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf

# COPY --chown=nginx:nginx --chmod=444 cert/server.pem /etc/nginx/ssl/server.pem
# COPY --chown=nginx:nginx --chmod=400 cert/server.key /etc/nginx/ssl/server.key

USER nginx
