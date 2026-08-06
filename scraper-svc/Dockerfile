# scraper-svc/Dockerfile — FastAPI Scraper microservice
FROM python:3.12-slim

WORKDIR /app

# Install uv package manager
RUN pip install --no-cache-dir uv

COPY pyproject.toml ./
RUN uv pip install --system -r pyproject.toml || pip install --no-cache-dir fastapi "uvicorn[standard]" asyncpraw pydantic redis asyncpg

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
