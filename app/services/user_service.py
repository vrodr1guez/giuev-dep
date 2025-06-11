from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get a user by email."""
        return db.query(User).filter(User.email == email).first()
    
    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get a list of users with pagination."""
        return db.query(User).offset(skip).limit(limit).all()
    
    def create_user(self, db: Session, obj_in: UserCreate) -> User:
        """Create a new user."""
        db_user = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            first_name=obj_in.first_name,
            last_name=obj_in.last_name,
            is_active=obj_in.is_active,
            organization_id=obj_in.organization_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def update_user(self, db: Session, db_obj: User, obj_in: UserUpdate) -> User:
        """Update a user."""
        update_data = obj_in.dict(exclude_unset=True)
        
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
            
        for field in update_data:
            setattr(db_obj, field, update_data[field])
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete_user(self, db: Session, user_id: int) -> None:
        """Delete a user."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
    
    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.
        
        Args:
            db: Database session
            email: User email
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        user = self.get_user_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def is_active(self, user: User) -> bool:
        """Check if a user is active."""
        return user.is_active
    
    def is_superuser(self, user: User) -> bool:
        """Check if a user has the superuser role."""
        return any(role.name == "admin" for role in user.roles)
    
    def has_role(self, user: User, role_name: str) -> bool:
        """Check if a user has a specific role."""
        return any(role.name == role_name for role in user.roles)
    
    def add_role_to_user(self, db: Session, user: User, role_name: str) -> None:
        """Add a role to a user."""
        role = db.query(Role).filter(Role.name == role_name).first()
        if role and role not in user.roles:
            user.roles.append(role)
            db.commit()
    
    def remove_role_from_user(self, db: Session, user: User, role_name: str) -> None:
        """Remove a role from a user."""
        role = db.query(Role).filter(Role.name == role_name).first()
        if role and role in user.roles:
            user.roles.remove(role)
            db.commit()


# Create a global service instance
user_service = UserService() 