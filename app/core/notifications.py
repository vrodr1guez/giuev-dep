import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from enum import Enum
import json

logger = logging.getLogger(__name__)

class NotificationType(Enum):
    CHARGING_STARTED = "charging_started"
    CHARGING_COMPLETED = "charging_completed"
    CHARGING_INTERRUPTED = "charging_interrupted"
    BATTERY_LOW = "battery_low"
    BATTERY_OPTIMAL = "battery_optimal"
    MAINTENANCE_REQUIRED = "maintenance_required"
    MAINTENANCE_SCHEDULED = "maintenance_scheduled"
    PRICE_ALERT = "price_alert"
    OPTIMIZATION_OPPORTUNITY = "optimization_opportunity"
    VEHICLE_STATUS_CHANGE = "vehicle_status_change"
    RENEWABLE_ENERGY_AVAILABLE = "renewable_energy_available"
    GRID_EVENT = "grid_event"
    # Energy marketplace notifications
    ENERGY_OFFER_CREATED = "energy_offer_created"
    ENERGY_OFFER_UPDATED = "energy_offer_updated"
    ENERGY_OFFER_SOLD = "energy_offer_sold"
    ENERGY_OFFER_EXPIRED = "energy_offer_expired"
    ENERGY_PURCHASE_CONFIRMED = "energy_purchase_confirmed"
    ENERGY_DELIVERY_SCHEDULED = "energy_delivery_scheduled"
    ENERGY_DELIVERY_STARTED = "energy_delivery_started"
    ENERGY_DELIVERY_COMPLETED = "energy_delivery_completed"
    CARBON_CREDITS_EARNED = "carbon_credits_earned"
    CARBON_CREDITS_VERIFIED = "carbon_credits_verified"
    CARBON_CREDITS_EXPIRING = "carbon_credits_expiring"

class NotificationChannel(Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"
    WEBSOCKET = "websocket"

class NotificationPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationService:
    """Service for handling system notifications across different channels."""
    
    def __init__(self, websocket_manager=None, email_service=None, sms_service=None):
        self.websocket_manager = websocket_manager
        self.email_service = email_service
        self.sms_service = sms_service
        
    async def send_notification(
        self,
        recipient_id: int,
        notification_type: Union[NotificationType, str],
        title: str,
        message: str,
        channels: List[Union[NotificationChannel, str]] = [NotificationChannel.IN_APP],
        priority: Union[NotificationPriority, str] = NotificationPriority.MEDIUM,
        data: Optional[Dict[str, Any]] = None,
        send_immediately: bool = True
    ) -> Dict[str, Any]:
        """
        Send a notification to a recipient through specified channels.
        
        Args:
            recipient_id: ID of the user or entity receiving the notification
            notification_type: Type of notification
            title: Notification title
            message: Notification content
            channels: List of channels to send the notification through
            priority: Priority level of the notification
            data: Additional data to include with the notification
            send_immediately: Whether to send immediately or queue for later
            
        Returns:
            Dictionary with status of each channel delivery
        """
        if isinstance(notification_type, str):
            notification_type = NotificationType(notification_type)
            
        if isinstance(priority, str):
            priority = NotificationPriority(priority)
            
        # Prepare the notification object
        notification = {
            "id": self._generate_notification_id(),
            "recipient_id": recipient_id,
            "type": notification_type.value,
            "title": title,
            "message": message,
            "priority": priority.value,
            "data": data or {},
            "created_at": datetime.utcnow().isoformat(),
            "read": False
        }
        
        # Store notification in database (implementation depends on db structure)
        # self._store_notification(notification)
        
        # Send through each requested channel
        results = {}
        for channel in channels:
            if isinstance(channel, str):
                channel = NotificationChannel(channel)
                
            try:
                if channel == NotificationChannel.EMAIL and self.email_service:
                    results["email"] = await self._send_email_notification(recipient_id, notification)
                elif channel == NotificationChannel.SMS and self.sms_service:
                    results["sms"] = await self._send_sms_notification(recipient_id, notification)
                elif channel == NotificationChannel.PUSH:
                    results["push"] = await self._send_push_notification(recipient_id, notification)
                elif channel == NotificationChannel.IN_APP:
                    results["in_app"] = await self._send_in_app_notification(recipient_id, notification)
                elif channel == NotificationChannel.WEBSOCKET and self.websocket_manager:
                    results["websocket"] = await self._send_websocket_notification(recipient_id, notification)
            except Exception as e:
                logger.error(f"Failed to send notification through {channel.value}: {str(e)}")
                results[channel.value] = {"success": False, "error": str(e)}
        
        return {
            "notification_id": notification["id"],
            "success": any(r.get("success", False) if isinstance(r, dict) else False for r in results.values()),
            "results": results
        }
    
    def _generate_notification_id(self) -> str:
        """Generate a unique notification ID."""
        import uuid
        return str(uuid.uuid4())
    
    async def _send_email_notification(self, recipient_id: int, notification: Dict[str, Any]) -> Dict[str, Any]:
        """Send notification via email."""
        try:
            # This would use the email service to send an actual email
            logger.info(f"Sending email notification to user {recipient_id}: {notification['title']}")
            # Actual implementation depends on email service
            return {"success": True}
        except Exception as e:
            logger.error(f"Email notification error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _send_sms_notification(self, recipient_id: int, notification: Dict[str, Any]) -> Dict[str, Any]:
        """Send notification via SMS."""
        try:
            # This would use the SMS service to send an actual text message
            logger.info(f"Sending SMS notification to user {recipient_id}: {notification['title']}")
            # Actual implementation depends on SMS service
            return {"success": True}
        except Exception as e:
            logger.error(f"SMS notification error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _send_push_notification(self, recipient_id: int, notification: Dict[str, Any]) -> Dict[str, Any]:
        """Send push notification to mobile device."""
        try:
            # This would connect to FCM, APNS, or other push notification service
            logger.info(f"Sending push notification to user {recipient_id}: {notification['title']}")
            # Placeholder for actual push notification service
            # self._send_to_push_service(recipient_id, notification)
            return {"success": True}
        except Exception as e:
            logger.error(f"Push notification error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _send_in_app_notification(self, recipient_id: int, notification: Dict[str, Any]) -> Dict[str, Any]:
        """Store notification for in-app display."""
        try:
            # Store in database for retrieval by the app
            logger.info(f"Saving in-app notification for user {recipient_id}: {notification['title']}")
            # self._store_in_app_notification(recipient_id, notification)
            return {"success": True}
        except Exception as e:
            logger.error(f"In-app notification error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _send_websocket_notification(self, recipient_id: int, notification: Dict[str, Any]) -> Dict[str, Any]:
        """Send real-time notification through websocket."""
        try:
            if self.websocket_manager:
                msg = {
                    "type": "notification",
                    "data": notification
                }
                await self.websocket_manager.send_personal_message(
                    json.dumps(msg), 
                    "notifications", 
                    str(recipient_id)
                )
                return {"success": True}
            return {"success": False, "error": "Websocket manager not initialized"}
        except Exception as e:
            logger.error(f"Websocket notification error: {str(e)}")
            return {"success": False, "error": str(e)}
            
    async def get_user_notifications(
        self, 
        user_id: int, 
        limit: int = 50, 
        offset: int = 0, 
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Retrieve notifications for a specific user.
        
        Args:
            user_id: The user ID to get notifications for
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip (for pagination)
            unread_only: Whether to return only unread notifications
            
        Returns:
            List of notification objects
        """
        # This would query the database for user notifications
        # Implementation depends on database structure
        logger.info(f"Retrieving notifications for user {user_id}")
        return []
    
    async def mark_notification_as_read(self, notification_id: str, user_id: int) -> bool:
        """
        Mark a notification as read.
        
        Args:
            notification_id: ID of the notification to mark
            user_id: ID of the user who owns the notification
            
        Returns:
            True if successful, False otherwise
        """
        # This would update the database entry for the notification
        logger.info(f"Marking notification {notification_id} as read for user {user_id}")
        return True
    
    async def mark_all_notifications_as_read(self, user_id: int) -> bool:
        """
        Mark all notifications for a user as read.
        
        Args:
            user_id: ID of the user whose notifications to mark
            
        Returns:
            True if successful, False otherwise
        """
        # This would update all unread notifications for the user
        logger.info(f"Marking all notifications as read for user {user_id}")
        return True
    
    async def delete_notification(self, notification_id: str, user_id: int) -> bool:
        """
        Delete a notification.
        
        Args:
            notification_id: ID of the notification to delete
            user_id: ID of the user who owns the notification
            
        Returns:
            True if successful, False otherwise
        """
        # This would delete the notification from the database
        logger.info(f"Deleting notification {notification_id} for user {user_id}")
        return True 