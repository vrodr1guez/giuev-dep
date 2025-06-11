"""
Observability Module for GIU EV Charging Infrastructure

This module provides comprehensive observability features including:
- Distributed tracing with OpenTelemetry
- Performance monitoring and analytics
- Service dependency mapping
- Real-time trace analysis
"""

__version__ = "1.0.0"

# Import key observability components for easy access
try:
    from .distributed_tracing import (
        TracingManager,
        TraceConfig,
        TraceAnalytics,
        ServiceDependencyMapper,
        get_tracing_manager,
        initialize_tracing,
        get_current_trace_context,
        trace_operation,
        trace_vin_operation,
        trace_ml_operation,
        trace_security_operation,
        create_child_span
    )
    
    OBSERVABILITY_COMPONENTS_AVAILABLE = True
    
except ImportError as e:
    print(f"⚠️  Some observability components not available: {e}")
    OBSERVABILITY_COMPONENTS_AVAILABLE = False

__all__ = [
    'TracingManager',
    'TraceConfig',
    'TraceAnalytics',
    'ServiceDependencyMapper',
    'get_tracing_manager',
    'initialize_tracing',
    'get_current_trace_context',
    'trace_operation',
    'trace_vin_operation',
    'trace_ml_operation',
    'trace_security_operation',
    'create_child_span',
    'OBSERVABILITY_COMPONENTS_AVAILABLE'
] 