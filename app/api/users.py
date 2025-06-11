from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
# Ensure UserWithRoles is defined
from app.schemas.user import User, UserCreate
from app.services.user_service import user_service as user_crud
from app.models.user import User as UserModel  # Renamed to avoid conflict
from app.api.deps import get_current_active_user, get_current_active_superuser

router = APIRouter()


@router.post("/", response_model=User, status_code=201)
def create_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    # Only superusers can create users directly
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Create new user.
    Protected - only superusers can create users directly.
    """
    user = user_crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = user_crud.create_user(db=db, obj_in=user_in)
    # Optionally assign default roles here if needed
    return user


# Use UserWithRoles to include roles
@router.get("/me", response_model=User)
def read_current_user_me(
    current_user: UserModel = Depends(get_current_active_user),
    # db session for fetching roles if not eager loaded
    db: Session = Depends(get_db)
):
    """
    Get current user details including roles.
    """
    # Ensure roles are loaded. If not eager loaded, you might need to fetch them.
    # The UserModel relationship should handle this if configured correctly.
    return current_user


@router.get("/{user_id}", response_model=User)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        get_current_active_superuser)  # Protect this
):
    """
    Get a specific user by id.
    """
    user = user_crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
