from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

from app.schemas.role import Role

# Base User schema (shared properties)


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    organization_id: Optional[int] = None

# For creating a new user


class UserCreate(UserBase):
    password: str

# For updating an existing user


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    organization_id: Optional[int] = None

# Basic User response model (no roles)


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "is_active": True,
                "organization_id": 1,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-02T00:00:00Z"
            }
        }
    }

# User with roles relationship


class UserWithRoles(User):
    roles: List[Role] = []
