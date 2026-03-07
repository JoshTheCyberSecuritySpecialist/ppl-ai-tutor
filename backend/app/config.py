from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-large"
    app_origin: str = "http://localhost:5173"

    jwt_secret: str
    jwt_expire_minutes: int = 1440

    supabase_url: str
    supabase_key: str

    class Config:
        env_file = ".env"

settings = Settings()