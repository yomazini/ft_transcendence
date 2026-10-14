# Nginx reverse proxy with ModSecurity3 (OWASP Core Rule Set) in front of
# gateway-svc. Owner: Madani.
FROM owasp/modsecurity-crs:nginx
# The base image runs as the non-root `nginx` user and renders every file in
# /etc/nginx/templates/ at start (envsubst). Copying straight into conf.d makes
# that step fail with "Permission denied", so the config goes in as a template.
COPY nginx.conf /etc/nginx/templates/conf.d/default.conf.template
