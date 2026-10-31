from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    postgres_user: str = "ft_transcendence"
    postgres_password: str = "changeme"
    postgres_db: str = "ft_transcendence"
    postgres_host: str = "postgres"
    postgres_port: int = 5432

    redis_host: str = "redis"
    redis_port: int = 6379
    queue_name: str = "scrape-job"
    events_channel: str = "job-events"

    embedding_model: str = "all-MiniLM-L6-v2"
    use_mock_embeddings: bool = False

    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "deepseek/deepseek-v4.1-flash"
    openrouter_fallback_models: str = (
        "nvidia/nemotron-3-ultra-550b-a55b:free"
    )
    openrouter_timeout: float = 45.0

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
