from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class TelematicsProvider(Base):
    """SQLAlchemy model for telematics providers."""
    __tablename__ = "telematics_provider"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    api_endpoint = Column(String(255), nullable=True)
    auth_token = Column(String(255), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vehicles = relationship("Vehicle", back_populates="telematics_provider")

    def __repr__(self):
        return f"<TelematicsProvider(id={self.id}, name={self.name})>" 