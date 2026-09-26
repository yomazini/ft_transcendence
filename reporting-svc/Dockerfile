FROM pgvector/pgvector:pg17

WORKDIR /app

COPY ./.postgres.env ./.env
COPY ./postgres.sh ./postgres.sh

RUN chmod +x postgres.sh

CMD ["./postgres.sh"]
