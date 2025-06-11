from typing import Generator, Optional, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.user_service import user_service
from app.db.session import get_db, SessionLocal
from app.schemas.token import TokenPayload
from app.models.user import User
from app.core.auth import get_current_user
from app import crud, models, schemas
from app.core import security
from app.core.notifications import NotificationService

# Service instances that should be singletons
_notification_service = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validates the token and returns the current user
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    user = user_service.get_user(db, user_id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user

# Dependency for checking specific roles


def require_role(required_role: str):
    def role_checker(current_user: User = Depends(
            get_current_active_user)) -> User:
        # Requires User model to have a relationship 'roles' (e.g., to a Role model)
        # and this relationship to be populated when the user is fetched.
        if not any(role.name == required_role for role in current_user.roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have the required {required_role} role"
            )
        return current_user
    return role_checker

def get_db() -> Generator:
    """
    Get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_db_websocket() -> Generator:
    """
    Get database session for WebSocket connections
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_notification_service() -> NotificationService:
    """Get the notification service singleton instance."""
    global _notification_service
    if _notification_service is None:
        # Currently initializing without websocket_manager
        # This would be set when the app starts
        _notification_service = NotificationService()
    return _notification_service


def set_notification_service(service: NotificationService) -> None:
    """Set the notification service for the application.
    
    This should be called when the application starts,
    after the websocket manager is initialized.
    """
    global _notification_service
    _notification_service = service
