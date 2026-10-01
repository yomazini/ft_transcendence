from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    postgres_user: str = "ft_transcendence"
    postgres_password: str = "changeme"
    postgres_db: str = "ft_transcendence"
    postgres_host: str = "postgres"
    postgres_port: int = 5432

    redis_host: str = "redis"
    redis_port: int = 6379

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
