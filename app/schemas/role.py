from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class RoleBase(BaseModel):
    """Base Role schema with shared attributes"""
    name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    """Schema for creating a new role"""
    pass


class RoleUpdate(RoleBase):
    """Schema for updating an existing role"""
    name: Optional[str] = None
    description: Optional[str] = None


class Role(RoleBase):
    """Schema for role responses"""
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}
