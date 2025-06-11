"""
Security Module for ML Endpoints

This module provides authentication and authorization functionality
for accessing ML model endpoints and monitoring services.
"""
import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Callable
from pathlib import Path
import secrets
import hashlib
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
API_KEY_HEADER = APIKeyHeader(name="X-API-Key")
OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.environ.get("ML_API_SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str
    expires_at: datetime


class TokenData(BaseModel):
    """Token data model"""
    username: Optional[str] = None
    scopes: List[str] = []


class User(BaseModel):
    """User model for authentication"""
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: bool = False
    scopes: List[str] = []


class APIKeyData(BaseModel):
    """API key data model"""
    key_id: str
    name: str
    scopes: List[str]
    created_at: datetime
    expires_at: Optional[datetime] = None
    created_by: str
    is_active: bool = True


# Available permission scopes
ML_SCOPES = {
    "ml:prediction:read": "Access prediction endpoints",
    "ml:prediction:write": "Store predictions/actuals",
    "ml:monitoring:read": "Access model monitoring data",
    "ml:monitoring:write": "Update monitoring settings",
    "ml:training:read": "View model training data",
    "ml:training:execute": "Execute model training/retraining",
    "ml:models:read": "View model registry",
    "ml:models:write": "Modify model registry entries",
    "ml:admin": "Full administrative access"
}


def get_password_hash(password: str) -> str:
    """Generate a secure hash of the password"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return get_password_hash(plain_password) == hashed_password


# Simulated databases - in production, use a proper database
USER_DB_FILE = "data/security/ml_users.json"
API_KEY_DB_FILE = "data/security/ml_api_keys.json"


def _load_user_db() -> Dict[str, Dict[str, Any]]:
    """Load the user database"""
    try:
        os.makedirs(os.path.dirname(USER_DB_FILE), exist_ok=True)
        if os.path.exists(USER_DB_FILE):
            with open(USER_DB_FILE, 'r') as f:
                return json.load(f)
        else:
            # Create default admin user if no database exists
            admin_pw = os.environ.get("ML_ADMIN_PASSWORD", "admin")
            users = {
                "admin": {
                    "username": "admin",
                    "full_name": "ML Administrator",
                    "email": "admin@example.com",
                    "hashed_password": get_password_hash(admin_pw),
                    "disabled": False,
                    "scopes": ["ml:admin"]
                }
            }
            _save_user_db(users)
            return users
    except Exception as e:
        logger.error(f"Error loading user database: {str(e)}")
        return {}


def _save_user_db(users: Dict[str, Dict[str, Any]]) -> None:
    """Save the user database"""
    try:
        os.makedirs(os.path.dirname(USER_DB_FILE), exist_ok=True)
        with open(USER_DB_FILE, 'w') as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving user database: {str(e)}")


def _load_api_key_db() -> Dict[str, Dict[str, Any]]:
    """Load the API key database"""
    try:
        os.makedirs(os.path.dirname(API_KEY_DB_FILE), exist_ok=True)
        if os.path.exists(API_KEY_DB_FILE):
            with open(API_KEY_DB_FILE, 'r') as f:
                return json.load(f)
        else:
            return {}
    except Exception as e:
        logger.error(f"Error loading API key database: {str(e)}")
        return {}


def _save_api_key_db(api_keys: Dict[str, Dict[str, Any]]) -> None:
    """Save the API key database"""
    try:
        os.makedirs(os.path.dirname(API_KEY_DB_FILE), exist_ok=True)
        with open(API_KEY_DB_FILE, 'w') as f:
            json.dump(api_keys, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving API key database: {str(e)}")


def get_user(username: str) -> Optional[User]:
    """Get a user by username"""
    users = _load_user_db()
    if username in users:
        user_data = users[username]
        return User(
            username=user_data["username"],
            email=user_data.get("email"),
            full_name=user_data.get("full_name"),
            disabled=user_data.get("disabled", False),
            scopes=user_data.get("scopes", [])
        )
    return None


def authenticate_user(username: str, password: str) -> Optional[User]:
    """Authenticate a user with username and password"""
    users = _load_user_db()
    if username in users:
        user_data = users[username]
        if verify_password(password, user_data["hashed_password"]):
            return User(
                username=user_data["username"],
                email=user_data.get("email"),
                full_name=user_data.get("full_name"),
                disabled=user_data.get("disabled", False),
                scopes=user_data.get("scopes", [])
            )
    return None


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expires = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expires})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_api_key(
    name: str,
    scopes: List[str],
    created_by: str,
    expires_in_days: Optional[int] = None
) -> APIKeyData:
    """Create a new API key"""
    # Generate a random key
    key = secrets.token_hex(32)
    key_id = hashlib.sha256(key.encode()).hexdigest()[:12]
    
    # Create API key data
    created_at = datetime.utcnow()
    expires_at = created_at + timedelta(days=expires_in_days) if expires_in_days else None
    
    api_key_data = APIKeyData(
        key_id=key_id,
        name=name,
        scopes=scopes,
        created_at=created_at,
        expires_at=expires_at,
        created_by=created_by,
        is_active=True
    )
    
    # Store in database
    api_keys = _load_api_key_db()
    api_keys[key] = api_key_data.dict()
    _save_api_key_db(api_keys)
    
    # Return the key and its data
    # Note: The actual key is only shown once upon creation
    return api_key_data


def validate_api_key(api_key: str = Security(API_KEY_HEADER)) -> APIKeyData:
    """Validate an API key and return its data"""
    api_keys = _load_api_key_db()
    
    if api_key not in api_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    key_data = api_keys[api_key]
    
    # Check if key is active
    if not key_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is inactive",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    # Check if key has expired
    if key_data.get("expires_at"):
        expires_at = datetime.fromisoformat(key_data["expires_at"].replace('Z', '+00:00'))
        if datetime.utcnow() > expires_at:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key has expired",
                headers={"WWW-Authenticate": "ApiKey"},
            )
    
    return APIKeyData(**key_data)


def get_current_user(token: str = Depends(OAUTH2_SCHEME)) -> User:
    """Get the current user from a JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
            
        token_scopes = payload.get("scopes", [])
        token_data = TokenData(username=username, scopes=token_scopes)
        
    except JWTError:
        raise credentials_exception
        
    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
        
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is disabled",
        )
        
    return user


def require_scopes(required_scopes: List[str]) -> Callable:
    """Decorator to require specific scopes"""
    def _require_scopes(
        user: User = Depends(get_current_user)
    ) -> User:
        for scope in required_scopes:
            if scope not in user.scopes and "ml:admin" not in user.scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied. Required scope: {scope}",
                )
        return user
    
    return _require_scopes


def require_api_key_scopes(required_scopes: List[str]) -> Callable:
    """Decorator to require specific API key scopes"""
    def _require_api_key_scopes(
        api_key_data: APIKeyData = Depends(validate_api_key)
    ) -> APIKeyData:
        for scope in required_scopes:
            if scope not in api_key_data.scopes and "ml:admin" not in api_key_data.scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied. Required scope: {scope}",
                )
        return api_key_data
    
    return _require_api_key_scopes


# Convenience dependencies for common permission patterns
get_prediction_read_permission = require_scopes(["ml:prediction:read"])
get_prediction_write_permission = require_scopes(["ml:prediction:write"])
get_monitoring_read_permission = require_scopes(["ml:monitoring:read"])
get_monitoring_write_permission = require_scopes(["ml:monitoring:write"])
get_training_read_permission = require_scopes(["ml:training:read"])
get_training_execute_permission = require_scopes(["ml:training:execute"])
get_models_read_permission = require_scopes(["ml:models:read"])
get_models_write_permission = require_scopes(["ml:models:write"])
get_admin_permission = require_scopes(["ml:admin"])

# API Key versions
api_key_prediction_read = require_api_key_scopes(["ml:prediction:read"])
api_key_prediction_write = require_api_key_scopes(["ml:prediction:write"])
api_key_monitoring_read = require_api_key_scopes(["ml:monitoring:read"])
api_key_monitoring_write = require_api_key_scopes(["ml:monitoring:write"])
api_key_training_read = require_api_key_scopes(["ml:training:read"])
api_key_training_execute = require_api_key_scopes(["ml:training:execute"])
api_key_models_read = require_api_key_scopes(["ml:models:read"])
api_key_models_write = require_api_key_scopes(["ml:models:write"])
api_key_admin = require_api_key_scopes(["ml:admin"])


# Authentication utilities for FastAPI endpoints
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get the current active user"""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 