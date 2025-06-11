"""
API Routes for ML Authentication

This module provides FastAPI routes for authenticating to ML endpoints,
managing API keys, and user accounts for ML services.
"""
import os
import sys
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.security.ml_auth import (
    User, Token, APIKeyData, authenticate_user, create_access_token,
    create_api_key, get_current_active_user, get_admin_permission, ML_SCOPES
)

# Create router
router = APIRouter(prefix="/api/ml/auth", tags=["ML Authentication"])


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Get an access token using username and password"""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user scopes
    access_token_expires = timedelta(minutes=60 * 24)  # 24 hours
    access_token = create_access_token(
        data={"sub": user.username, "scopes": user.scopes},
        expires_delta=access_token_expires
    )
    
    # Calculate expiration time
    expires_at = datetime.now() + access_token_expires
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expires_at
    }


@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get information about the current user"""
    return current_user


@router.get("/scopes", response_model=Dict[str, str])
async def get_available_scopes(current_user: User = Depends(get_current_active_user)):
    """Get available permission scopes"""
    return ML_SCOPES


@router.post("/api-keys", response_model=Dict[str, Any])
async def create_new_api_key(
    name: str,
    scopes: List[str],
    expires_in_days: Optional[int] = None,
    current_user: User = Depends(get_admin_permission)
):
    """
    Create a new API key
    
    Only admins can create API keys
    """
    # Validate scopes
    for scope in scopes:
        if scope not in ML_SCOPES and scope != "ml:admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid scope: {scope}"
            )
    
    # Generate a random key
    import secrets
    key = secrets.token_hex(32)
    
    # Create API key
    api_key_data = create_api_key(
        name=name,
        scopes=scopes,
        created_by=current_user.username,
        expires_in_days=expires_in_days
    )
    
    # Return the API key (it will only be shown once)
    return {
        "api_key": key,
        "key_id": api_key_data.key_id,
        "name": api_key_data.name,
        "scopes": api_key_data.scopes,
        "created_at": api_key_data.created_at,
        "expires_at": api_key_data.expires_at,
        "message": "IMPORTANT: Save this API key as it will not be shown again"
    }


@router.get("/api-keys", response_model=List[APIKeyData])
async def list_api_keys(current_user: User = Depends(get_admin_permission)):
    """
    List all API keys
    
    Only admins can list API keys
    """
    # Load API keys db
    from app.api.security.ml_auth import _load_api_key_db
    api_keys = _load_api_key_db()
    
    # Convert to APIKeyData objects
    result = []
    for key, data in api_keys.items():
        # Convert strings to datetime
        if "created_at" in data and isinstance(data["created_at"], str):
            data["created_at"] = datetime.fromisoformat(data["created_at"].replace('Z', '+00:00'))
        
        if "expires_at" in data and data["expires_at"] and isinstance(data["expires_at"], str):
            data["expires_at"] = datetime.fromisoformat(data["expires_at"].replace('Z', '+00:00'))
        
        result.append(APIKeyData(**data))
    
    return result


@router.post("/api-keys/{key_id}/revoke", response_model=Dict[str, Any])
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_admin_permission)
):
    """
    Revoke an API key
    
    Only admins can revoke API keys
    """
    # Load API keys db
    from app.api.security.ml_auth import _load_api_key_db, _save_api_key_db
    api_keys = _load_api_key_db()
    
    # Find the key with this ID
    target_key = None
    for key, data in api_keys.items():
        if data.get("key_id") == key_id:
            target_key = key
            break
    
    if not target_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key with ID {key_id} not found"
        )
    
    # Revoke the key
    api_keys[target_key]["is_active"] = False
    _save_api_key_db(api_keys)
    
    return {
        "message": f"API key {key_id} has been revoked",
        "key_id": key_id
    } 