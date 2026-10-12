FROM hashicorp/vault:1.15

EXPOSE 8200

COPY --chmod=755 tools/entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "server", "-dev" ]
