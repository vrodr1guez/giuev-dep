import logging
import logging.config
import sys
from pathlib import Path

from app.core.config import settings

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "default",
            "stream": sys.stdout,
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "DEBUG",
            "formatter": "detailed",
            "filename": "logs/app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
        "ocpp_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "DEBUG",
            "formatter": "detailed",
            "filename": "logs/ocpp.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
    },
    "loggers": {
        "app": {
            "level": "DEBUG",
            "handlers": ["console", "file"],
            "propagate": False,
        },
        "app.ocpp": {
            "level": "DEBUG",
            "handlers": ["console", "ocpp_file"],
            "propagate": False,
        },
        "ocpp": {
            "level": "DEBUG",
            "handlers": ["console", "ocpp_file"],
            "propagate": False,
        },
        "websockets": {
            "level": "INFO",
            "handlers": ["console", "file"],
            "propagate": False,
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"],
    },
}

def setup_logging():
    """Setup logging configuration"""
    logging.config.dictConfig(LOGGING_CONFIG)

# Create logger instance
logger = logging.getLogger("app")

# Setup logging on import
setup_logging()

def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the given name.
    """
    return logging.getLogger(name)

def configure_logging() -> None:
    """
    Configure logging for the application.
    """
    import logging.config
    try:
        logging.config.dictConfig(LOGGING_CONFIG)
        logging.info("Logging configured successfully")
    except Exception as e:
        logging.warning(f"Error configuring logging: {e}. Using basic configuration.")
        logging.basicConfig(
            level=settings.LOG_LEVEL,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler("logs/app.log"),
            ],
        )

# Set up a default logger for backward compatibility first, before any configuration
logger = logging.getLogger("app")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)
logger.setLevel(settings.LOG_LEVEL)
logger.propagate = False

# Configure logging on module import with fallback
configure_logging()

# Example usage in other modules:
# from app.core.logging import get_logger
# logger = get_logger(__name__)
