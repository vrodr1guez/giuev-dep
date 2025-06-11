from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate


class RoleService:
    def get_role(self, db: Session, role_id: int) -> Optional[Role]:
        """Get role by ID."""
        return db.query(Role).filter(Role.id == role_id).first()
    
    def get_role_by_name(self, db: Session, name: str) -> Optional[Role]:
        """Get role by name."""
        return db.query(Role).filter(Role.name == name).first()
    
    def get_roles(self, db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
        """Get a list of roles."""
        return db.query(Role).offset(skip).limit(limit).all()
    
    def create_role(self, db: Session, role: RoleCreate) -> Role:
        """Create a new role."""
        db_role = Role(**role.dict())
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role
    
    def update_role(self, db: Session, db_obj: Role, obj_in: RoleUpdate) -> Role:
        """Update a role."""
        update_data = obj_in.dict(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete_role(self, db: Session, role_id: int) -> None:
        """Delete a role."""
        db_obj = self.get_role(db, role_id)
        if db_obj:
            db.delete(db_obj)
            db.commit()


role_service = RoleService()