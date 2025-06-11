"""
Automated Incident Response System for GIU EV Charging Infrastructure

This module implements automated incident response workflows that react to security
threats in real-time, execute remediation actions, and manage the incident lifecycle.

Features:
- Automated threat response workflows
- Configurable response policies
- Incident escalation management
- Real-time action execution
- Response effectiveness tracking
- Integration with security and monitoring systems
"""

import asyncio
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable, Set
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from pathlib import Path

try:
    import structlog
    STRUCTLOG_AVAILABLE = True
    logger = structlog.get_logger("incident_response")
except ImportError:
    import logging
    STRUCTLOG_AVAILABLE = False
    logger = logging.getLogger("incident_response")

# Import security components
from .threat_detection import ThreatDetection, ThreatLevel, ThreatType

class IncidentStatus(Enum):
    """Incident status values"""
    NEW = "new"
    INVESTIGATING = "investigating"
    RESPONDING = "responding"
    MITIGATED = "mitigated"
    RESOLVED = "resolved"
    CLOSED = "closed"

class ResponseAction(Enum):
    """Types of automated response actions"""
    BLOCK_IP = "block_ip"
    RATE_LIMIT_IP = "rate_limit_ip"
    BLOCK_USER = "block_user"
    REVOKE_SESSION = "revoke_session"
    ALERT_SECURITY_TEAM = "alert_security_team"
    LOG_EVENT = "log_event"
    QUARANTINE_DEVICE = "quarantine_device"
    DISABLE_ENDPOINT = "disable_endpoint"
    ESCALATE_TO_HUMAN = "escalate_to_human"
    COLLECT_FORENSICS = "collect_forensics"
    NOTIFY_STAKEHOLDERS = "notify_stakeholders"
    UPDATE_FIREWALL = "update_firewall"

class ResponsePriority(Enum):
    """Response action priority levels"""
    IMMEDIATE = "immediate"  # Execute within seconds
    HIGH = "high"           # Execute within minutes
    MEDIUM = "medium"       # Execute within 15 minutes
    LOW = "low"            # Execute within 1 hour

@dataclass
class SecurityIncident:
    """Security incident data structure"""
    id: str
    threat_detection: ThreatDetection
    status: IncidentStatus
    created_at: datetime
    updated_at: datetime
    severity: ThreatLevel
    automated_responses: List[str]
    manual_responses: List[str]
    escalation_level: int
    assigned_to: Optional[str]
    resolution_notes: Optional[str]
    response_effectiveness: Optional[float]
    forensic_data: Dict[str, Any]

@dataclass
class ResponseRule:
    """Automated response rule configuration"""
    id: str
    name: str
    threat_types: List[ThreatType]
    threat_levels: List[ThreatLevel]
    conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    cooldown_minutes: int
    max_executions_per_hour: int
    enabled: bool
    created_by: str
    description: str

@dataclass
class ResponseActionResult:
    """Result of executing a response action"""
    action_type: ResponseAction
    success: bool
    execution_time: datetime
    duration_seconds: float
    error_message: Optional[str]
    details: Dict[str, Any]

class IPBlockingManager:
    """Manages IP blocking and rate limiting"""
    
    def __init__(self):
        self.blocked_ips: Set[str] = set()
        self.rate_limited_ips: Dict[str, datetime] = {}
        self.block_durations: Dict[str, timedelta] = {}
        
    def block_ip(self, ip: str, duration_hours: int = 24) -> bool:
        """Block an IP address for specified duration"""
        try:
            self.blocked_ips.add(ip)
            self.block_durations[ip] = datetime.now() + timedelta(hours=duration_hours)
            logger.info(f"Blocked IP {ip} for {duration_hours} hours")
            return True
        except Exception as e:
            logger.error(f"Failed to block IP {ip}: {str(e)}")
            return False
    
    def unblock_ip(self, ip: str) -> bool:
        """Unblock an IP address"""
        try:
            self.blocked_ips.discard(ip)
            self.block_durations.pop(ip, None)
            logger.info(f"Unblocked IP {ip}")
            return True
        except Exception as e:
            logger.error(f"Failed to unblock IP {ip}: {str(e)}")
            return False
    
    def is_blocked(self, ip: str) -> bool:
        """Check if IP is currently blocked"""
        if ip not in self.blocked_ips:
            return False
        
        # Check if block has expired
        if ip in self.block_durations:
            if datetime.now() > self.block_durations[ip]:
                self.unblock_ip(ip)
                return False
        
        return True
    
    def rate_limit_ip(self, ip: str, duration_minutes: int = 60) -> bool:
        """Apply rate limiting to an IP"""
        try:
            self.rate_limited_ips[ip] = datetime.now() + timedelta(minutes=duration_minutes)
            logger.info(f"Rate limited IP {ip} for {duration_minutes} minutes")
            return True
        except Exception as e:
            logger.error(f"Failed to rate limit IP {ip}: {str(e)}")
            return False
    
    def cleanup_expired(self):
        """Clean up expired blocks and rate limits"""
        now = datetime.now()
        
        # Clean expired blocks
        expired_blocks = [ip for ip, expire_time in self.block_durations.items() if now > expire_time]
        for ip in expired_blocks:
            self.unblock_ip(ip)
        
        # Clean expired rate limits
        expired_limits = [ip for ip, expire_time in self.rate_limited_ips.items() if now > expire_time]
        for ip in expired_limits:
            del self.rate_limited_ips[ip]

class NotificationManager:
    """Manages security notifications and alerts"""
    
    def __init__(self):
        self.notification_channels = {}
        
    def register_channel(self, name: str, callback: Callable):
        """Register a notification channel"""
        self.notification_channels[name] = callback
        
    async def send_alert(self, incident: SecurityIncident, channels: List[str] = None) -> Dict[str, bool]:
        """Send security alert through specified channels"""
        if channels is None:
            channels = list(self.notification_channels.keys())
        
        results = {}
        
        alert_data = {
            "incident_id": incident.id,
            "threat_type": incident.threat_detection.threat_type.value,
            "severity": incident.severity.value,
            "source_ip": incident.threat_detection.source_ip,
            "endpoint": incident.threat_detection.endpoint,
            "description": incident.threat_detection.description,
            "timestamp": incident.created_at.isoformat(),
            "recommended_actions": incident.threat_detection.recommended_actions
        }
        
        for channel in channels:
            if channel in self.notification_channels:
                try:
                    await self.notification_channels[channel](alert_data)
                    results[channel] = True
                    logger.info(f"Alert sent via {channel}")
                except Exception as e:
                    results[channel] = False
                    logger.error(f"Failed to send alert via {channel}: {str(e)}")
            else:
                results[channel] = False
                logger.warning(f"Unknown notification channel: {channel}")
        
        return results

class ForensicsCollector:
    """Collects forensic data for security incidents"""
    
    def __init__(self):
        self.collection_enabled = True
        
    async def collect_incident_data(self, incident: SecurityIncident) -> Dict[str, Any]:
        """Collect comprehensive forensic data for incident"""
        if not self.collection_enabled:
            return {}
        
        forensic_data = {
            "collection_timestamp": datetime.now().isoformat(),
            "incident_id": incident.id,
            "threat_details": {
                "type": incident.threat_detection.threat_type.value,
                "level": incident.threat_detection.threat_level.value,
                "confidence": incident.threat_detection.confidence_score,
                "source_ip": incident.threat_detection.source_ip,
                "endpoint": incident.threat_detection.endpoint,
                "user_id": incident.threat_detection.user_id,
                "evidence": incident.threat_detection.evidence,
                "ml_features": incident.threat_detection.ml_features
            },
            "system_state": await self._collect_system_state(),
            "network_info": await self._collect_network_info(incident.threat_detection.source_ip),
            "related_events": await self._collect_related_events(incident)
        }
        
        return forensic_data
    
    async def _collect_system_state(self) -> Dict[str, Any]:
        """Collect current system state information"""
        return {
            "timestamp": datetime.now().isoformat(),
            "active_sessions": "collected",  # Placeholder
            "system_load": "collected",      # Placeholder
            "memory_usage": "collected",     # Placeholder
            "disk_usage": "collected"        # Placeholder
        }
    
    async def _collect_network_info(self, source_ip: str) -> Dict[str, Any]:
        """Collect network information about source IP"""
        return {
            "source_ip": source_ip,
            "geolocation": "unknown",        # Would integrate with GeoIP service
            "reputation": "unknown",         # Would integrate with threat intel
            "reverse_dns": "unknown",        # Would perform reverse DNS lookup
            "open_ports": []                 # Would perform port scan if allowed
        }
    
    async def _collect_related_events(self, incident: SecurityIncident) -> List[Dict[str, Any]]:
        """Collect related security events"""
        # This would query security event logs for related events
        return []

class ResponseActionExecutor:
    """Executes automated response actions"""
    
    def __init__(
        self,
        ip_manager: IPBlockingManager,
        notification_manager: NotificationManager,
        forensics_collector: ForensicsCollector
    ):
        self.ip_manager = ip_manager
        self.notification_manager = notification_manager
        self.forensics_collector = forensics_collector
        
        # Action handlers
        self.action_handlers = {
            ResponseAction.BLOCK_IP: self._block_ip,
            ResponseAction.RATE_LIMIT_IP: self._rate_limit_ip,
            ResponseAction.BLOCK_USER: self._block_user,
            ResponseAction.REVOKE_SESSION: self._revoke_session,
            ResponseAction.ALERT_SECURITY_TEAM: self._alert_security_team,
            ResponseAction.LOG_EVENT: self._log_event,
            ResponseAction.COLLECT_FORENSICS: self._collect_forensics,
            ResponseAction.NOTIFY_STAKEHOLDERS: self._notify_stakeholders,
            ResponseAction.ESCALATE_TO_HUMAN: self._escalate_to_human
        }
    
    async def execute_action(
        self,
        action: ResponseAction,
        incident: SecurityIncident,
        parameters: Dict[str, Any] = None
    ) -> ResponseActionResult:
        """Execute a specific response action"""
        start_time = datetime.now()
        parameters = parameters or {}
        
        try:
            if action in self.action_handlers:
                success, details = await self.action_handlers[action](incident, parameters)
                error_message = None
            else:
                success = False
                details = {}
                error_message = f"Unknown action type: {action}"
            
        except Exception as e:
            success = False
            details = {}
            error_message = str(e)
            logger.error(f"Error executing action {action}: {str(e)}")
        
        duration = (datetime.now() - start_time).total_seconds()
        
        return ResponseActionResult(
            action_type=action,
            success=success,
            execution_time=start_time,
            duration_seconds=duration,
            error_message=error_message,
            details=details
        )
    
    async def _block_ip(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Block source IP address"""
        duration_hours = params.get('duration_hours', 24)
        ip = incident.threat_detection.source_ip
        
        success = self.ip_manager.block_ip(ip, duration_hours)
        details = {
            "ip": ip,
            "duration_hours": duration_hours,
            "action": "IP blocked"
        }
        
        return success, details
    
    async def _rate_limit_ip(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Apply rate limiting to source IP"""
        duration_minutes = params.get('duration_minutes', 60)
        ip = incident.threat_detection.source_ip
        
        success = self.ip_manager.rate_limit_ip(ip, duration_minutes)
        details = {
            "ip": ip,
            "duration_minutes": duration_minutes,
            "action": "IP rate limited"
        }
        
        return success, details
    
    async def _block_user(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Block user account"""
        user_id = incident.threat_detection.user_id
        if not user_id:
            return False, {"error": "No user ID available"}
        
        # Placeholder for user blocking logic
        logger.info(f"Blocking user {user_id}")
        details = {
            "user_id": user_id,
            "action": "User blocked"
        }
        
        return True, details
    
    async def _revoke_session(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Revoke user session"""
        user_id = incident.threat_detection.user_id
        if not user_id:
            return False, {"error": "No user ID available"}
        
        # Placeholder for session revocation logic
        logger.info(f"Revoking sessions for user {user_id}")
        details = {
            "user_id": user_id,
            "action": "Sessions revoked"
        }
        
        return True, details
    
    async def _alert_security_team(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Send alert to security team"""
        channels = params.get('channels', ['email', 'slack'])
        results = await self.notification_manager.send_alert(incident, channels)
        
        success = any(results.values())
        details = {
            "channels": channels,
            "results": results,
            "action": "Security team alerted"
        }
        
        return success, details
    
    async def _log_event(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Log security event"""
        log_level = params.get('level', 'warning')
        
        log_data = {
            "incident_id": incident.id,
            "threat_type": incident.threat_detection.threat_type.value,
            "source_ip": incident.threat_detection.source_ip,
            "severity": incident.severity.value
        }
        
        if log_level == 'critical':
            logger.critical("Security incident", **log_data)
        elif log_level == 'error':
            logger.error("Security incident", **log_data)
        else:
            logger.warning("Security incident", **log_data)
        
        details = {
            "log_level": log_level,
            "action": "Event logged"
        }
        
        return True, details
    
    async def _collect_forensics(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Collect forensic data"""
        forensic_data = await self.forensics_collector.collect_incident_data(incident)
        incident.forensic_data.update(forensic_data)
        
        details = {
            "data_collected": len(forensic_data),
            "action": "Forensics collected"
        }
        
        return True, details
    
    async def _notify_stakeholders(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Notify relevant stakeholders"""
        stakeholders = params.get('stakeholders', ['admin'])
        
        # Placeholder for stakeholder notification
        logger.info(f"Notifying stakeholders: {stakeholders}")
        details = {
            "stakeholders": stakeholders,
            "action": "Stakeholders notified"
        }
        
        return True, details
    
    async def _escalate_to_human(self, incident: SecurityIncident, params: Dict[str, Any]) -> tuple[bool, Dict[str, Any]]:
        """Escalate incident to human analyst"""
        escalation_level = params.get('level', 1)
        incident.escalation_level = escalation_level
        
        logger.info(f"Escalating incident {incident.id} to level {escalation_level}")
        details = {
            "escalation_level": escalation_level,
            "action": "Escalated to human"
        }
        
        return True, details

class IncidentResponseEngine:
    """Main incident response orchestration engine"""
    
    def __init__(self):
        # Initialize components
        self.ip_manager = IPBlockingManager()
        self.notification_manager = NotificationManager()
        self.forensics_collector = ForensicsCollector()
        self.action_executor = ResponseActionExecutor(
            self.ip_manager,
            self.notification_manager,
            self.forensics_collector
        )
        
        # Response rules and incidents
        self.response_rules: List[ResponseRule] = []
        self.active_incidents: Dict[str, SecurityIncident] = {}
        self.rule_execution_history: Dict[str, List[datetime]] = {}
        
        # Load default rules
        self._load_default_rules()
        
        logger.info("Incident Response Engine initialized")
    
    def _load_default_rules(self):
        """Load default response rules"""
        default_rules = [
            ResponseRule(
                id="rule_001",
                name="Block Critical Threats",
                threat_types=[ThreatType.INJECTION_ATTACK, ThreatType.BRUTE_FORCE],
                threat_levels=[ThreatLevel.CRITICAL, ThreatLevel.HIGH],
                conditions={},
                actions=[
                    {"type": ResponseAction.BLOCK_IP, "params": {"duration_hours": 24}},
                    {"type": ResponseAction.ALERT_SECURITY_TEAM, "params": {"channels": ["email", "slack"]}},
                    {"type": ResponseAction.COLLECT_FORENSICS, "params": {}},
                    {"type": ResponseAction.LOG_EVENT, "params": {"level": "critical"}}
                ],
                cooldown_minutes=5,
                max_executions_per_hour=10,
                enabled=True,
                created_by="system",
                description="Automatically block IPs for critical injection attacks and brute force attempts"
            ),
            ResponseRule(
                id="rule_002", 
                name="Rate Limit Abuse Response",
                threat_types=[ThreatType.RATE_LIMIT_ABUSE, ThreatType.API_ABUSE],
                threat_levels=[ThreatLevel.MEDIUM, ThreatLevel.HIGH],
                conditions={},
                actions=[
                    {"type": ResponseAction.RATE_LIMIT_IP, "params": {"duration_minutes": 120}},
                    {"type": ResponseAction.LOG_EVENT, "params": {"level": "warning"}},
                    {"type": ResponseAction.ALERT_SECURITY_TEAM, "params": {"channels": ["slack"]}}
                ],
                cooldown_minutes=10,
                max_executions_per_hour=20,
                enabled=True,
                created_by="system",
                description="Apply rate limiting for API abuse and excessive requests"
            ),
            ResponseRule(
                id="rule_003",
                name="Anomalous Behavior Investigation",
                threat_types=[ThreatType.ANOMALOUS_BEHAVIOR, ThreatType.SUSPICIOUS_PATTERN],
                threat_levels=[ThreatLevel.MEDIUM],
                conditions={},
                actions=[
                    {"type": ResponseAction.LOG_EVENT, "params": {"level": "warning"}},
                    {"type": ResponseAction.COLLECT_FORENSICS, "params": {}},
                    {"type": ResponseAction.ESCALATE_TO_HUMAN, "params": {"level": 1}}
                ],
                cooldown_minutes=30,
                max_executions_per_hour=5,
                enabled=True,
                created_by="system",
                description="Investigate and escalate anomalous behavior patterns"
            )
        ]
        
        self.response_rules.extend(default_rules)
    
    async def handle_threat(self, threat: ThreatDetection) -> SecurityIncident:
        """Main entry point for handling detected threats"""
        # Create security incident
        incident = SecurityIncident(
            id=self._generate_incident_id(),
            threat_detection=threat,
            status=IncidentStatus.NEW,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            severity=threat.threat_level,
            automated_responses=[],
            manual_responses=[],
            escalation_level=0,
            assigned_to=None,
            resolution_notes=None,
            response_effectiveness=None,
            forensic_data={}
        )
        
        # Store incident
        self.active_incidents[incident.id] = incident
        
        # Find matching response rules
        matching_rules = self._find_matching_rules(threat)
        
        if matching_rules:
            incident.status = IncidentStatus.RESPONDING
            
            # Execute automated responses
            for rule in matching_rules:
                if self._can_execute_rule(rule):
                    await self._execute_rule(rule, incident)
        else:
            # No automated rules matched, escalate to human
            incident.status = IncidentStatus.INVESTIGATING
            await self.action_executor.execute_action(
                ResponseAction.ESCALATE_TO_HUMAN,
                incident,
                {"level": 1}
            )
        
        incident.updated_at = datetime.now()
        
        logger.info(f"Created incident {incident.id} for threat {threat.id}")
        return incident
    
    def _find_matching_rules(self, threat: ThreatDetection) -> List[ResponseRule]:
        """Find response rules that match the threat"""
        matching_rules = []
        
        for rule in self.response_rules:
            if not rule.enabled:
                continue
            
            # Check threat type match
            if threat.threat_type not in rule.threat_types:
                continue
            
            # Check threat level match
            if threat.threat_level not in rule.threat_levels:
                continue
            
            # Check additional conditions (if any)
            if rule.conditions:
                # Implement condition checking logic here
                pass
            
            matching_rules.append(rule)
        
        return matching_rules
    
    def _can_execute_rule(self, rule: ResponseRule) -> bool:
        """Check if rule can be executed based on rate limits"""
        now = datetime.now()
        rule_id = rule.id
        
        # Initialize execution history for rule
        if rule_id not in self.rule_execution_history:
            self.rule_execution_history[rule_id] = []
        
        # Clean old executions
        cutoff_time = now - timedelta(hours=1)
        self.rule_execution_history[rule_id] = [
            exec_time for exec_time in self.rule_execution_history[rule_id]
            if exec_time > cutoff_time
        ]
        
        # Check hourly limit
        if len(self.rule_execution_history[rule_id]) >= rule.max_executions_per_hour:
            logger.warning(f"Rule {rule_id} exceeded hourly execution limit")
            return False
        
        # Check cooldown
        if self.rule_execution_history[rule_id]:
            last_execution = max(self.rule_execution_history[rule_id])
            cooldown_period = timedelta(minutes=rule.cooldown_minutes)
            if now - last_execution < cooldown_period:
                logger.info(f"Rule {rule_id} in cooldown period")
                return False
        
        return True
    
    async def _execute_rule(self, rule: ResponseRule, incident: SecurityIncident):
        """Execute all actions in a response rule"""
        logger.info(f"Executing rule {rule.id} for incident {incident.id}")
        
        # Record rule execution
        self.rule_execution_history[rule.id].append(datetime.now())
        
        # Execute each action in the rule
        for action_config in rule.actions:
            action_type = action_config["type"]
            action_params = action_config.get("params", {})
            
            try:
                result = await self.action_executor.execute_action(
                    action_type,
                    incident,
                    action_params
                )
                
                # Record the response
                response_record = f"{action_type.value}: {result.success}"
                incident.automated_responses.append(response_record)
                
                logger.info(f"Executed action {action_type.value}: {result.success}")
                
            except Exception as e:
                error_record = f"{action_type.value}: ERROR - {str(e)}"
                incident.automated_responses.append(error_record)
                logger.error(f"Failed to execute action {action_type.value}: {str(e)}")
    
    def _generate_incident_id(self) -> str:
        """Generate unique incident ID"""
        timestamp = str(int(time.time() * 1000))
        return f"INC-{timestamp}"
    
    def get_incident_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get summary of incidents in specified time period"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        recent_incidents = [
            incident for incident in self.active_incidents.values()
            if incident.created_at > cutoff_time
        ]
        
        summary = {
            "time_period_hours": hours,
            "total_incidents": len(recent_incidents),
            "incidents_by_status": {},
            "incidents_by_severity": {},
            "automated_responses_executed": 0,
            "escalated_incidents": 0
        }
        
        for incident in recent_incidents:
            # Count by status
            status = incident.status.value
            summary["incidents_by_status"][status] = summary["incidents_by_status"].get(status, 0) + 1
            
            # Count by severity
            severity = incident.severity.value
            summary["incidents_by_severity"][severity] = summary["incidents_by_severity"].get(severity, 0) + 1
            
            # Count automated responses
            summary["automated_responses_executed"] += len(incident.automated_responses)
            
            # Count escalations
            if incident.escalation_level > 0:
                summary["escalated_incidents"] += 1
        
        return summary
    
    def update_incident_status(self, incident_id: str, status: IncidentStatus, notes: str = None):
        """Update incident status"""
        if incident_id in self.active_incidents:
            incident = self.active_incidents[incident_id]
            incident.status = status
            incident.updated_at = datetime.now()
            if notes:
                incident.resolution_notes = notes
            
            logger.info(f"Updated incident {incident_id} status to {status.value}")
    
    def register_notification_channel(self, name: str, callback: Callable):
        """Register a notification channel"""
        self.notification_manager.register_channel(name, callback)

# Global incident response engine
_incident_response_engine = None

def get_incident_response_engine() -> IncidentResponseEngine:
    """Get global incident response engine instance"""
    global _incident_response_engine
    if _incident_response_engine is None:
        _incident_response_engine = IncidentResponseEngine()
    return _incident_response_engine 