# This file will have the content of the old token.py moved here.
# I will read the old token.py and then write its content here. 

from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    Token schema for OAuth2 token response.
    """
    access_token: str
    token_type: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }
    }


class TokenData(BaseModel):
    """
    TokenData schema for decoded token data.
    """
    email: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com"
            }
        }
    } 