from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from typing import Dict, Any, Optional

from app.db.base_class import Base
from app.core.notifications import NotificationType, NotificationPriority, NotificationChannel

class UserNotificationPreference(Base):
    """User preferences for notification delivery."""
    __tablename__ = "user_notification_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_type = Column(String(50), nullable=False)
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    in_app_enabled = Column(Boolean, default=True)
    
    # Minimum priority to trigger this notification type
    min_priority = Column(String(20), default="medium")
    
    # Time restrictions (e.g., don't send at night)
    quiet_hours_start = Column(Integer, nullable=True)  # 24-hour format, e.g. 22 for 10 PM
    quiet_hours_end = Column(Integer, nullable=True)    # 24-hour format, e.g. 8 for 8 AM
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notification_preferences")


class Notification(Base):
    """Model for storing user notifications."""
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notification_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="medium")
    data = Column(JSON, nullable=True)
    read = Column(Boolean, default=False)
    
    # Notification delivery status
    email_sent = Column(Boolean, default=False)
    sms_sent = Column(Boolean, default=False)
    push_sent = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert notification to dictionary for API response."""
        return {
            "id": self.id,
            "type": self.notification_type,
            "title": self.title,
            "message": self.message,
            "priority": self.priority,
            "data": self.data,
            "read": self.read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None
        }


class NotificationTemplate(Base):
    """Templates for notification messages."""
    __tablename__ = "notification_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    notification_type = Column(String(50), nullable=False)
    title_template = Column(Text, nullable=False)
    message_template = Column(Text, nullable=False)
    default_priority = Column(String(20), nullable=False, default="medium")
    
    # Optional template for specific channels
    email_template = Column(Text, nullable=True)
    sms_template = Column(Text, nullable=True)
    push_template = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    def format_notification(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format this template with the given context values.
        
        Args:
            context: Dictionary of values to insert into the template
            
        Returns:
            Dictionary with formatted title and message
        """
        import re
        
        # Simple template formatting with {variable} syntax
        title = self.title_template
        message = self.message_template
        
        # Replace variables in templates
        for key, value in context.items():
            pattern = r'\{' + key + r'\}'
            title = re.sub(pattern, str(value), title)
            message = re.sub(pattern, str(value), message)
        
        return {
            "title": title,
            "message": message,
            "notification_type": self.notification_type,
            "priority": self.default_priority
        } 