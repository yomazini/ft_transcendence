# analysis-svc/Dockerfile — FastAPI Analysis microservice
FROM python:3.12-slim

WORKDIR /app

# Install lightweight CPU-only PyTorch first (avoids downloading 1.5GB of unused CUDA binaries)
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch

# Install application dependencies and test framework
COPY pyproject.toml ./
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" vaderSentiment sentence-transformers google-generativeai pgvector asyncpg redis pydantic pydantic-settings httpx pytest pytest-asyncio numpy

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
