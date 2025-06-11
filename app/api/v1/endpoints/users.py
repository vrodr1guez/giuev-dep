from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.user import User, UserCreate, UserUpdate, UserWithRoles
from app.services.user_service import user_service
from app.services.role_service import role_service as role_crud
from app.models.user import User as UserModel
from app.api.deps import get_current_active_user, get_current_active_superuser

router = APIRouter()


@router.post("/", response_model=User, status_code=201)
def create_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Create new user.
    Protected - only superusers can create users directly.
    """
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = user_service.create_user(db=db, obj_in=user_in)
    # Optionally assign default roles here if needed
    return user


@router.get("/me", response_model=UserWithRoles)
def read_current_user_me(
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user details including roles.
    """
    return current_user


@router.get("/{user_id}", response_model=UserWithRoles)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Get a specific user by id.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=List[UserWithRoles])
def read_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Retrieve users.
    """
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users


@router.put("/{user_id}", response_model=UserWithRoles)
def update_existing_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Update a user.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = user_service.update_user(db=db, db_obj=user, obj_in=user_in)
    return user


@router.post("/{user_id}/roles/{role_id}", response_model=UserWithRoles)
def assign_role_to_user(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Assign a role to a user.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    role = role_crud.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if role in user.roles:
        raise HTTPException(
            status_code=400,
            detail="User already has this role")

    user.roles.append(role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}/roles/{role_id}", response_model=UserWithRoles)
def remove_role_from_user(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Remove a role from a user.
    """
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    role = role_crud.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if role not in user.roles:
        raise HTTPException(
            status_code=400,
            detail="User does not have this role")

    user.roles.remove(role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
