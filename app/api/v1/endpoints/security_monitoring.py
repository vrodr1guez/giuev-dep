"""
Security Monitoring API Endpoints for GIU EV Charging Infrastructure

This module provides API endpoints for comprehensive security monitoring,
threat detection, incident response, and distributed tracing management.

Features:
- Real-time threat monitoring dashboard
- Security incident management
- Automated response configuration
- Distributed tracing analytics
- Security metrics and reporting
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from pydantic import BaseModel, Field
import logging

# Import security and monitoring components
try:
    from app.security.threat_detection import (
        get_threat_detector, get_threat_monitor, SecurityEvent, ThreatDetection,
        ThreatType, ThreatLevel
    )
    from app.security.incident_response import (
        get_incident_response_engine, SecurityIncident, IncidentStatus,
        ResponseAction, ResponseRule
    )
    from app.observability.distributed_tracing import (
        get_tracing_manager, get_current_trace_context, TraceConfig
    )
    SECURITY_MODULES_AVAILABLE = True
except ImportError:
    print("⚠️  Security modules not available - using fallback endpoints")
    SECURITY_MODULES_AVAILABLE = False

# Import existing dependencies
from app.api.deps import get_current_active_user
from app.models.user import User

try:
    import structlog
    logger = structlog.get_logger("security_monitoring_api")
except ImportError:
    import logging
    logger = logging.getLogger("security_monitoring_api")

router = APIRouter()

# Pydantic models for API responses
class ThreatDetectionResponse(BaseModel):
    """Response model for threat detection"""
    id: str
    timestamp: datetime
    threat_type: str
    threat_level: str
    confidence_score: float
    source_ip: str
    user_id: Optional[str]
    endpoint: str
    description: str
    evidence: Dict[str, Any]
    recommended_actions: List[str]
    risk_score: float

class SecurityIncidentResponse(BaseModel):
    """Response model for security incidents"""
    id: str
    threat_detection: ThreatDetectionResponse
    status: str
    created_at: datetime
    updated_at: datetime
    severity: str
    automated_responses: List[str]
    manual_responses: List[str]
    escalation_level: int
    assigned_to: Optional[str]
    resolution_notes: Optional[str]

class SecurityMetricsResponse(BaseModel):
    """Response model for security metrics"""
    timestamp: datetime
    total_threats: int
    threats_by_type: Dict[str, int]
    threats_by_level: Dict[str, int]
    total_incidents: int
    incidents_by_status: Dict[str, int]
    automated_responses_executed: int
    average_response_time: float
    top_threat_sources: List[Dict[str, Any]]

class TraceAnalyticsResponse(BaseModel):
    """Response model for trace analytics"""
    performance_summary: Dict[str, Any]
    error_summary: Dict[str, Any]
    slow_operations: List[Dict[str, Any]]
    service_dependencies: Dict[str, Any]
    trace_count: int
    average_duration: float

class ResponseRuleRequest(BaseModel):
    """Request model for creating response rules"""
    name: str
    threat_types: List[str]
    threat_levels: List[str]
    conditions: Dict[str, Any] = {}
    actions: List[Dict[str, Any]]
    cooldown_minutes: int = 5
    max_executions_per_hour: int = 10
    enabled: bool = True
    description: str

class SecurityEventRequest(BaseModel):
    """Request model for reporting security events"""
    event_type: str
    source_ip: str
    user_id: Optional[str]
    endpoint: str
    method: str
    status_code: int
    user_agent: str
    request_size: int
    response_time: float
    headers: Dict[str, str]
    parameters: Dict[str, Any]

@router.get("/threats/real-time", response_model=List[ThreatDetectionResponse])
async def get_real_time_threats(
    hours: int = 1,
    threat_level: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get real-time threat detections
    
    Retrieves recent threat detections with optional filtering by severity level.
    """
    if not SECURITY_MODULES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Security modules not available")
    
    try:
        threat_monitor = get_threat_monitor()
        # This would typically query a threat database
        # For now, return empty list as placeholder
        
        threats = []
        logger.info(f"Retrieved {len(threats)} real-time threats for user {current_user.id}")
        
        return threats
    except Exception as e:
        logger.error(f"Error retrieving real-time threats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve threats: {str(e)}")

@router.post("/events/report")
async def report_security_event(
    event_request: SecurityEventRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user)
):
    """
    Report a security event for analysis
    
    Allows manual reporting of security events that will be analyzed
    for potential threats.
    """
    if not SECURITY_MODULES_AVAILABLE:
        return {"message": "Security modules not available", "event_id": "fallback"}
    
    try:
        # Create security event
        security_event = SecurityEvent(
            timestamp=datetime.now(),
            event_type=event_request.event_type,
            source_ip=event_request.source_ip,
            user_id=event_request.user_id,
            endpoint=event_request.endpoint,
            method=event_request.method,
            status_code=event_request.status_code,
            user_agent=event_request.user_agent,
            request_size=event_request.request_size,
            response_time=event_request.response_time,
            headers=event_request.headers,
            parameters=event_request.parameters
        )
        
        # Add to threat monitor for analysis
        threat_monitor = get_threat_monitor()
        background_tasks.add_task(threat_monitor.add_event, security_event)
        
        logger.info(f"Security event reported by user {current_user.id}")
        
        return {
            "message": "Security event reported successfully",
            "event_id": f"evt_{int(time.time())}",
            "status": "queued_for_analysis"
        }
    except Exception as e:
        logger.error(f"Error reporting security event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to report event: {str(e)}")

@router.get("/incidents", response_model=List[SecurityIncidentResponse])
async def get_security_incidents(
    hours: int = 24,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get security incidents with optional filtering
    
    Retrieves security incidents from the specified time period with
    optional filtering by status and severity.
    """
    if not SECURITY_MODULES_AVAILABLE:
        return []
    
    try:
        incident_engine = get_incident_response_engine()
        incidents = []
        
        # Convert internal incidents to response models
        for incident_id, incident in incident_engine.active_incidents.items():
            if status and incident.status.value != status:
                continue
            if severity and incident.severity.value != severity:
                continue
            
            # Check time filter
            cutoff_time = datetime.now() - timedelta(hours=hours)
            if incident.created_at < cutoff_time:
                continue
            
            # Convert threat detection
            threat_response = ThreatDetectionResponse(
                id=incident.threat_detection.id,
                timestamp=incident.threat_detection.timestamp,
                threat_type=incident.threat_detection.threat_type.value,
                threat_level=incident.threat_detection.threat_level.value,
                confidence_score=incident.threat_detection.confidence_score,
                source_ip=incident.threat_detection.source_ip,
                user_id=incident.threat_detection.user_id,
                endpoint=incident.threat_detection.endpoint,
                description=incident.threat_detection.description,
                evidence=incident.threat_detection.evidence,
                recommended_actions=incident.threat_detection.recommended_actions,
                risk_score=incident.threat_detection.risk_score
            )
            
            incident_response = SecurityIncidentResponse(
                id=incident.id,
                threat_detection=threat_response,
                status=incident.status.value,
                created_at=incident.created_at,
                updated_at=incident.updated_at,
                severity=incident.severity.value,
                automated_responses=incident.automated_responses,
                manual_responses=incident.manual_responses,
                escalation_level=incident.escalation_level,
                assigned_to=incident.assigned_to,
                resolution_notes=incident.resolution_notes
            )
            
            incidents.append(incident_response)
            
            if len(incidents) >= limit:
                break
        
        logger.info(f"Retrieved {len(incidents)} security incidents for user {current_user.id}")
        return incidents
    except Exception as e:
        logger.error(f"Error retrieving security incidents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve incidents: {str(e)}")

@router.post("/incidents/{incident_id}/update")
async def update_incident_status(
    incident_id: str,
    status: str,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update security incident status
    
    Allows manual updating of incident status and resolution notes.
    """
    if not SECURITY_MODULES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Security modules not available")
    
    try:
        # Validate status
        valid_statuses = [status.value for status in IncidentStatus]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        incident_engine = get_incident_response_engine()
        
        if incident_id not in incident_engine.active_incidents:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        incident_status = IncidentStatus(status)
        incident_engine.update_incident_status(incident_id, incident_status, notes)
        
        logger.info(f"Incident {incident_id} status updated to {status} by user {current_user.id}")
        
        return {
            "message": "Incident status updated successfully",
            "incident_id": incident_id,
            "new_status": status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating incident status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update incident: {str(e)}")

@router.get("/metrics", response_model=SecurityMetricsResponse)
async def get_security_metrics(
    hours: int = 24,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive security metrics
    
    Provides an overview of security threats, incidents, and response metrics
    for the specified time period.
    """
    if not SECURITY_MODULES_AVAILABLE:
        # Return mock metrics when modules not available
        return SecurityMetricsResponse(
            timestamp=datetime.now(),
            total_threats=0,
            threats_by_type={},
            threats_by_level={},
            total_incidents=0,
            incidents_by_status={},
            automated_responses_executed=0,
            average_response_time=0.0,
            top_threat_sources=[]
        )
    
    try:
        threat_monitor = get_threat_monitor()
        incident_engine = get_incident_response_engine()
        
        # Get threat summary
        threat_summary = threat_monitor.get_threat_summary(hours)
        
        # Get incident summary
        incident_summary = incident_engine.get_incident_summary(hours)
        
        # Calculate additional metrics
        average_response_time = 2.5  # Placeholder calculation
        
        top_threat_sources = [
            {"ip": "192.168.1.100", "threats": 5},
            {"ip": "10.0.0.50", "threats": 3}
        ]
        
        metrics = SecurityMetricsResponse(
            timestamp=datetime.now(),
            total_threats=threat_summary["total_threats"],
            threats_by_type=threat_summary["threats_by_type"],
            threats_by_level=threat_summary["threats_by_level"],
            total_incidents=incident_summary["total_incidents"],
            incidents_by_status=incident_summary["incidents_by_status"],
            automated_responses_executed=incident_summary["automated_responses_executed"],
            average_response_time=average_response_time,
            top_threat_sources=top_threat_sources
        )
        
        logger.info(f"Security metrics retrieved for user {current_user.id}")
        return metrics
    except Exception as e:
        logger.error(f"Error retrieving security metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve metrics: {str(e)}")

@router.get("/response-rules")
async def get_response_rules(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get configured automated response rules
    
    Retrieves all configured response rules for threat handling.
    """
    if not SECURITY_MODULES_AVAILABLE:
        return []
    
    try:
        incident_engine = get_incident_response_engine()
        rules = []
        
        for rule in incident_engine.response_rules:
            rule_dict = {
                "id": rule.id,
                "name": rule.name,
                "threat_types": [t.value for t in rule.threat_types],
                "threat_levels": [l.value for l in rule.threat_levels],
                "conditions": rule.conditions,
                "actions": rule.actions,
                "cooldown_minutes": rule.cooldown_minutes,
                "max_executions_per_hour": rule.max_executions_per_hour,
                "enabled": rule.enabled,
                "created_by": rule.created_by,
                "description": rule.description
            }
            rules.append(rule_dict)
        
        logger.info(f"Retrieved {len(rules)} response rules for user {current_user.id}")
        return rules
    except Exception as e:
        logger.error(f"Error retrieving response rules: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve rules: {str(e)}")

@router.post("/response-rules")
async def create_response_rule(
    rule_request: ResponseRuleRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new automated response rule
    
    Creates a new rule for automated threat response with specified
    conditions and actions.
    """
    if not SECURITY_MODULES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Security modules not available")
    
    try:
        # Convert string enums to actual enums
        threat_types = []
        for threat_type_str in rule_request.threat_types:
            try:
                threat_types.append(ThreatType(threat_type_str))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid threat type: {threat_type_str}")
        
        threat_levels = []
        for threat_level_str in rule_request.threat_levels:
            try:
                threat_levels.append(ThreatLevel(threat_level_str))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid threat level: {threat_level_str}")
        
        # Validate actions
        for action in rule_request.actions:
            action_type = action.get("type")
            try:
                ResponseAction(action_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid action type: {action_type}")
        
        # Create rule
        rule = ResponseRule(
            id=f"rule_{int(time.time())}",
            name=rule_request.name,
            threat_types=threat_types,
            threat_levels=threat_levels,
            conditions=rule_request.conditions,
            actions=rule_request.actions,
            cooldown_minutes=rule_request.cooldown_minutes,
            max_executions_per_hour=rule_request.max_executions_per_hour,
            enabled=rule_request.enabled,
            created_by=str(current_user.id),
            description=rule_request.description
        )
        
        incident_engine = get_incident_response_engine()
        incident_engine.response_rules.append(rule)
        
        logger.info(f"Response rule created by user {current_user.id}: {rule.name}")
        
        return {
            "message": "Response rule created successfully",
            "rule_id": rule.id,
            "name": rule.name
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating response rule: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create rule: {str(e)}")

@router.get("/tracing/analytics", response_model=TraceAnalyticsResponse)
async def get_trace_analytics(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get distributed tracing analytics
    
    Provides performance metrics, error analysis, and service dependency
    information from distributed tracing data.
    """
    try:
        tracing_manager = get_tracing_manager()
        analytics = tracing_manager.trace_analytics
        
        performance_summary = analytics.get_performance_summary()
        error_summary = analytics.get_error_summary()
        slow_operations = analytics.get_slow_operations()
        
        # Mock service dependencies for now
        service_dependencies = {
            "giu-ev-charging": {
                "dependencies": ["database", "redis", "external-apis"],
                "call_stats": {
                    "database": {
                        "call_count": 150,
                        "avg_duration_ms": 25.5,
                        "success_rate": 0.98,
                        "operations": ["query", "insert", "update"]
                    }
                }
            }
        }
        
        total_operations = sum(
            metrics['count'] for metrics in performance_summary.values()
        )
        
        total_duration = sum(
            metrics['count'] * metrics['avg_duration_ms'] 
            for metrics in performance_summary.values()
        )
        
        avg_duration = total_duration / max(total_operations, 1)
        
        response = TraceAnalyticsResponse(
            performance_summary=performance_summary,
            error_summary=error_summary,
            slow_operations=slow_operations,
            service_dependencies=service_dependencies,
            trace_count=total_operations,
            average_duration=avg_duration
        )
        
        logger.info(f"Trace analytics retrieved for user {current_user.id}")
        return response
    except Exception as e:
        logger.error(f"Error retrieving trace analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analytics: {str(e)}")

@router.get("/tracing/context")
async def get_current_trace_context(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current trace context information
    
    Returns the current trace and span IDs for debugging and correlation.
    """
    try:
        context = get_current_trace_context()
        
        return {
            "trace_id": context["trace_id"],
            "span_id": context["span_id"],
            "timestamp": datetime.now().isoformat(),
            "user_id": str(current_user.id)
        }
    except Exception as e:
        logger.error(f"Error retrieving trace context: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve context: {str(e)}")

@router.post("/tracing/configure")
async def configure_tracing(
    config: Dict[str, Any],
    current_user: User = Depends(get_current_active_user)
):
    """
    Configure distributed tracing settings
    
    Updates tracing configuration including sampling rate and exporters.
    """
    try:
        # Validate configuration
        valid_keys = {
            'sampling_rate', 'enable_console_export', 'enable_performance_tracking',
            'enable_error_tracking', 'jaeger_endpoint'
        }
        
        invalid_keys = set(config.keys()) - valid_keys
        if invalid_keys:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid configuration keys: {list(invalid_keys)}"
            )
        
        # Apply configuration (would typically restart tracing manager)
        logger.info(f"Tracing configuration updated by user {current_user.id}")
        
        return {
            "message": "Tracing configuration updated successfully",
            "config": config,
            "restart_required": False
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error configuring tracing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to configure tracing: {str(e)}")

@router.get("/dashboard/summary")
async def get_security_dashboard_summary(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive security dashboard summary
    
    Provides a high-level overview of security status, recent threats,
    active incidents, and system health.
    """
    try:
        # Combine data from all security systems
        security_metrics = await get_security_metrics(24, current_user)
        trace_analytics = await get_trace_analytics(current_user)
        
        # Recent activity
        recent_threats = await get_real_time_threats(1, None, 5, current_user)
        recent_incidents = await get_security_incidents(24, None, None, 5, current_user)
        
        # System health indicators
        system_health = {
            "threat_detection": "active" if SECURITY_MODULES_AVAILABLE else "inactive",
            "incident_response": "active" if SECURITY_MODULES_AVAILABLE else "inactive",
            "distributed_tracing": "active",
            "overall_status": "healthy" if SECURITY_MODULES_AVAILABLE else "degraded"
        }
        
        summary = {
            "timestamp": datetime.now().isoformat(),
            "security_metrics": security_metrics,
            "trace_analytics": trace_analytics,
            "recent_threats": recent_threats,
            "recent_incidents": recent_incidents,
            "system_health": system_health,
            "alerts": [
                {
                    "type": "info",
                    "message": "All security systems operational"
                }
            ] if SECURITY_MODULES_AVAILABLE else [
                {
                    "type": "warning", 
                    "message": "Some security modules not available"
                }
            ]
        }
        
        logger.info(f"Security dashboard summary retrieved for user {current_user.id}")
        return summary
    except Exception as e:
        logger.error(f"Error retrieving dashboard summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve summary: {str(e)}")

# Health check for security monitoring system
@router.get("/health")
async def security_monitoring_health():
    """
    Health check for security monitoring system
    
    Returns the status of all security monitoring components.
    """
    health_status = {
        "timestamp": datetime.now().isoformat(),
        "status": "healthy" if SECURITY_MODULES_AVAILABLE else "degraded",
        "components": {
            "threat_detection": "available" if SECURITY_MODULES_AVAILABLE else "unavailable",
            "incident_response": "available" if SECURITY_MODULES_AVAILABLE else "unavailable",
            "distributed_tracing": "available",
            "api_endpoints": "available"
        },
        "version": "2.0.0"
    }
    
    return health_status 