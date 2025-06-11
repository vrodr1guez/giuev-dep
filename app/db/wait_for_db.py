#!/usr/bin/env python
import time
import socket
import os
import sys
import logging
from urllib.parse import urlparse

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db():
    """Wait for the database to be available."""
    
    # Parse the database URL to get the host and port
    db_url = settings.DATABASE_URL
    parsed_url = urlparse(db_url)
    
    # Default PostgreSQL port
    default_port = 5432
    
    # Extract host and port
    db_host = parsed_url.hostname
    db_port = parsed_url.port or default_port
    
    if not db_host:
        logger.error("Could not parse database host from URL")
        sys.exit(1)
    
    logger.info(f"Waiting for database at {db_host}:{db_port}...")
    
    # Maximum number of retries
    max_retries = 60
    retry_interval = 1  # seconds
    
    # Try to connect to the database
    for i in range(max_retries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((db_host, db_port))
            sock.close()
            
            if result == 0:
                logger.info("Database is available!")
                return
            
        except socket.error as e:
            logger.warning(f"Socket error: {e}")
        
        logger.info(f"Database not available yet. Retrying in {retry_interval} seconds...")
        time.sleep(retry_interval)
    
    logger.error(f"Database connection failed after {max_retries} attempts")
    sys.exit(1)

if __name__ == "__main__":
    wait_for_db() 