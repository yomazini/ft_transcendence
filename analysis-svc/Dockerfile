FROM python:3.12-slim

WORKDIR /app

# Install CPU-only PyTorch first, so it is cached and does not pull CUDA libraries.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch

# not used only for me ref ; keep track of 
COPY pyproject.toml ./

# --no-cache-dir keeps the image smaller
RUN pip install --no-cache-dir --default-timeout=1000 \
    fastapi "uvicorn[standard]" vaderSentiment textblob sentence-transformers \
    asyncpg redis pydantic pydantic-settings \
    httpx numpy bullmq prometheus-client hvac

COPY . .

EXPOSE 8001

# exec form get docker  signasl
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
