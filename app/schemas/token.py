from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """Token schema for OAuth2 responses"""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Payload contained in JWT tokens"""
    sub: Optional[int] = None  # User ID
    exp: Optional[int] = None  # Expiration time (Unix timestamp)