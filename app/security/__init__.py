"""
Security Module for GIU EV Charging Infrastructure

This module provides comprehensive security features including:
- ML-based threat detection
- Automated incident response
- Real-time security monitoring
"""

__version__ = "1.0.0"

# Import key security components for easy access
try:
    from .threat_detection import (
        ThreatDetector,
        ThreatMonitor,
        SecurityEvent,
        ThreatDetection,
        ThreatType,
        ThreatLevel,
        get_threat_detector,
        get_threat_monitor
    )
    
    from .incident_response import (
        IncidentResponseEngine,
        SecurityIncident,
        ResponseAction,
        ResponseRule,
        IncidentStatus,
        get_incident_response_engine
    )
    
    SECURITY_COMPONENTS_AVAILABLE = True
    
except ImportError as e:
    print(f"⚠️  Some security components not available: {e}")
    SECURITY_COMPONENTS_AVAILABLE = False

__all__ = [
    'ThreatDetector',
    'ThreatMonitor', 
    'SecurityEvent',
    'ThreatDetection',
    'ThreatType',
    'ThreatLevel',
    'IncidentResponseEngine',
    'SecurityIncident',
    'ResponseAction',
    'ResponseRule',
    'IncidentStatus',
    'get_threat_detector',
    'get_threat_monitor',
    'get_incident_response_engine',
    'SECURITY_COMPONENTS_AVAILABLE'
] 