# scraper-svc/Dockerfile — Reddit scraper worker (BullMQ consumer). Owner: Madani.
FROM python:3.13-slim
WORKDIR /app
RUN pip install --no-cache-dir uv

# README.md is required by pyproject.toml (readme field) to build the package.
COPY pyproject.toml uv.lock README.md ./
COPY src ./src
RUN uv sync --frozen --no-dev

# A queue worker: it listens to Redis, it does not serve HTTP.
CMD ["uv", "run", "--no-sync", "scraper-svc"]
