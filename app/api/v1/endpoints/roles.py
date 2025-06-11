from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.role import Role, RoleCreate, RoleUpdate
from app.services.role_service import role_service
from app.models.user import User as UserModel
from app.api.deps import get_current_active_superuser

router = APIRouter()


@router.post("/", response_model=Role, status_code=201)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Create new role.
    """
    role = role_service.get_role_by_name(db, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=400,
            detail="The role with this name already exists in the system.",
        )
    role = role_service.create_role(db=db, obj_in=role_in)
    return role


@router.get("/", response_model=List[Role])
def read_roles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Retrieve roles.
    """
    roles = role_service.get_roles(db, skip=skip, limit=limit)
    return roles


@router.get("/{role_id}", response_model=Role)
def read_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Get a specific role by id.
    """
    role = role_service.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/{role_id}", response_model=Role)
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Update a role.
    """
    role = role_service.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Check for name uniqueness if name is being updated
    if role_in.name and role_in.name != role.name:
        existing_role = role_service.get_role_by_name(db, name=role_in.name)
        if existing_role:
            raise HTTPException(
                status_code=400,
                detail="The role with this name already exists in the system.",
            )

    role = role_service.update_role(db=db, db_obj=role, obj_in=role_in)
    return role


@router.delete("/{role_id}", response_model=Role)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Delete a role.
    """
    role = role_service.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Check if any users have this role before deleting
    if role.users and len(role.users) > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete role as it is assigned to users. Remove the role from all users first.",
        )

    role = role_service.delete_role(db=db, role_id=role_id)
    return role
