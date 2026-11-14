from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    postgres_user: str = "ft_transcendence"
    postgres_password: str = ""
    postgres_db: str = "ft_transcendence"
    postgres_host: str = "postgres"
    postgres_port: int = 5432

    redis_host: str = "redis"
    redis_port: int = 6379
    queue_name: str = "analyze-job"
    events_channel: str = "job-events"

    embedding_model: str = "all-MiniLM-L6-v2"

    rag_top_k: int = 5
    report_top_k: int = 10
    worker_concurrency: int = 2
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "deepseek/deepseek-v4.1-flash"
    openrouter_fallback_models: str = "google/gemma-4-26b-a4b-it"
    openrouter_timeout: float = 45.0


settings = Settings()
