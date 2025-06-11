from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.session import get_db
from app.schemas.auth_token import Token
from app.schemas.user import User  # For current_user type hint
from app.services.user_service import user_service
from app.core.security import create_access_token
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()

'''
@router.post("/login/access-token", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    This route is likely duplicated by app.api.v1.endpoints.login.router
    and can cause a path conflict if both are registered under the same prefix.
    Commenting out to prevent potential startup errors.
    Consider consolidating login routes.
    """
    user = user_service.authenticate(
        db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user_service.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
'''

# Example of a protected endpoint


@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Test endpoint to get current user.
    """
    return current_user
