import os
import secrets
from typing import Optional, Dict, Any, List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings.
    
    These settings can be configured using environment variables.
    For example, to override the value of `SECRET_KEY`, set the environment variable `SECRET_KEY`.
    """
    # Project information
    PROJECT_NAME: str = "EV Charging Infrastructure"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Professional EV Charging Infrastructure Management Platform"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALLOWED_HOSTS: List[str] = os.getenv("ALLOWED_HOSTS", "*").split(",")
    
    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8000"
    ]
    
    # Database settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./ev_charging.db"
    )
    
    # OCPP Settings
    OCPP_HOST: str = os.getenv("OCPP_HOST", "0.0.0.0")
    OCPP_PORT: int = int(os.getenv("OCPP_PORT", "9000"))
    OCPP_SUPPORTED_VERSIONS: List[str] = ["1.6", "2.0.1"]
    OCPP_HEARTBEAT_INTERVAL: int = int(os.getenv("OCPP_HEARTBEAT_INTERVAL", "300"))  # seconds
    OCPP_CONNECTION_TIMEOUT: int = int(os.getenv("OCPP_CONNECTION_TIMEOUT", "30"))  # seconds
    
    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "logs/app.log")
    
    # Redis settings (for future use with caching/sessions)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # Authentication settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # External service URLs
    ML_DASHBOARD_URL: str = os.getenv("ML_DASHBOARD_URL", "http://localhost:8503")
    
    # Email settings (for notifications)
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "true").lower() == "true"
    SMTP_PORT: Optional[int] = int(os.getenv("SMTP_PORT", "587")) if os.getenv("SMTP_PORT") else None
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    # OCPP Firmware update settings
    FIRMWARE_UPLOAD_DIR: str = os.getenv("FIRMWARE_UPLOAD_DIR", "uploads/firmware")
    FIRMWARE_MAX_SIZE: int = int(os.getenv("FIRMWARE_MAX_SIZE", "104857600"))  # 100MB
    
    model_config = SettingsConfigDict(case_sensitive=True)
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_staging(self) -> bool:
        return self.ENVIRONMENT.lower() == "staging"
    

# Create a global settings instance
settings = Settings() 