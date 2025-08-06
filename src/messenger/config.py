from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    database_url: str
    secret_key: SecretStr
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"


settings = Settings()