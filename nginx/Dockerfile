FROM owasp/modsecurity-crs:4.25.2-nginx-202610180210-lts

COPY conf/nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY conf/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf /etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf

USER nginx
