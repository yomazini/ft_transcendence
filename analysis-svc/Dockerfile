FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch

COPY pyproject.toml ./
RUN pip install --no-cache-dir --default-timeout=1000 \
    fastapi "uvicorn[standard]" vaderSentiment textblob sentence-transformers \
    google-generativeai pgvector asyncpg redis pydantic pydantic-settings \
    httpx pytest pytest-asyncio numpy bullmq prometheus-client hvac

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
