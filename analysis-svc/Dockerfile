# analysis-svc/Dockerfile — FastAPI Analysis microservice
FROM python:3.12-slim

WORKDIR /app

# Install uv package manager
RUN pip install --no-cache-dir uv

COPY pyproject.toml ./
RUN uv pip install --system -r pyproject.toml || pip install --no-cache-dir fastapi "uvicorn[standard]" vaderSentiment sentence-transformers google-generativeai pgvector asyncpg redis pydantic

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
