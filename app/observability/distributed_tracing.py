"""
Distributed Tracing System for GIU EV Charging Infrastructure

This module implements comprehensive distributed tracing using OpenTelemetry
to provide end-to-end observability across the EV charging infrastructure.

Features:
- OpenTelemetry integration for distributed tracing
- Custom span creation and management
- Trace correlation across services
- Performance metrics collection
- Error tracking and debugging
- Service dependency mapping
- Real-time trace analysis
"""

import time
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable, Union
from contextlib import asynccontextmanager, contextmanager
from dataclasses import dataclass
import logging
from functools import wraps

# OpenTelemetry imports with fallbacks
try:
    from opentelemetry import trace, baggage
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
    from opentelemetry.exporter.jaeger.thrift import JaegerExporter
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.instrumentation.requests import RequestsInstrumentor
    from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
    from opentelemetry.instrumentation.redis import RedisInstrumentor
    from opentelemetry.propagate import extract, inject
    from opentelemetry.trace.status import Status, StatusCode
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.semconv.resource import ResourceAttributes
    OPENTELEMETRY_AVAILABLE = True
except ImportError:
    print("⚠️  OpenTelemetry not available - using fallback tracing")
    OPENTELEMETRY_AVAILABLE = False
    
    # Create fallback classes
    class MockSpan:
        def __init__(self, name: str):
            self.name = name
            self.attributes = {}
            self.status = None
            
        def set_attribute(self, key: str, value: Any):
            self.attributes[key] = value
            
        def set_status(self, status: Any):
            self.status = status
            
        def record_exception(self, exception: Exception):
            pass
            
        def __enter__(self):
            return self
            
        def __exit__(self, exc_type, exc_val, exc_tb):
            pass
    
    class MockTracer:
        def start_as_current_span(self, name: str, **kwargs):
            return MockSpan(name)
            
        def start_span(self, name: str, **kwargs):
            return MockSpan(name)

try:
    import structlog
    STRUCTLOG_AVAILABLE = True
    logger = structlog.get_logger("distributed_tracing")
except ImportError:
    import logging
    STRUCTLOG_AVAILABLE = False
    logger = logging.getLogger("distributed_tracing")

@dataclass
class TraceConfig:
    """Configuration for distributed tracing"""
    service_name: str = "giu-ev-charging"
    service_version: str = "2.0.0"
    environment: str = "development"
    jaeger_endpoint: Optional[str] = None
    sampling_rate: float = 1.0
    enable_console_export: bool = True
    enable_performance_tracking: bool = True
    enable_error_tracking: bool = True
    custom_attributes: Dict[str, str] = None

class TracingManager:
    """Main distributed tracing manager"""
    
    def __init__(self, config: TraceConfig = None):
        self.config = config or TraceConfig()
        self.tracer = None
        self.instrumentors = []
        self.active_spans = {}
        self.trace_analytics = TraceAnalytics()
        
        # Initialize tracing
        self._initialize_tracing()
        
        logger.info("Distributed Tracing Manager initialized")
    
    def _initialize_tracing(self):
        """Initialize OpenTelemetry tracing"""
        if not OPENTELEMETRY_AVAILABLE:
            logger.warning("OpenTelemetry not available, using fallback tracer")
            self.tracer = MockTracer()
            return
        
        # Create resource
        resource = Resource.create({
            ResourceAttributes.SERVICE_NAME: self.config.service_name,
            ResourceAttributes.SERVICE_VERSION: self.config.service_version,
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: self.config.environment,
            **(self.config.custom_attributes or {})
        })
        
        # Set up tracer provider
        tracer_provider = TracerProvider(resource=resource)
        trace.set_tracer_provider(tracer_provider)
        
        # Set up exporters
        if self.config.enable_console_export:
            console_exporter = ConsoleSpanExporter()
            span_processor = BatchSpanProcessor(console_exporter)
            tracer_provider.add_span_processor(span_processor)
        
        if self.config.jaeger_endpoint:
            jaeger_exporter = JaegerExporter(
                agent_host_name="localhost",
                agent_port=6831,
            )
            span_processor = BatchSpanProcessor(jaeger_exporter)
            tracer_provider.add_span_processor(span_processor)
        
        # Get tracer
        self.tracer = trace.get_tracer(__name__)
        
        # Set up auto-instrumentation
        self._setup_auto_instrumentation()
    
    def _setup_auto_instrumentation(self):
        """Set up automatic instrumentation for common libraries"""
        if not OPENTELEMETRY_AVAILABLE:
            return
        
        try:
            # FastAPI instrumentation
            FastAPIInstrumentor().instrument()
            self.instrumentors.append("fastapi")
            
            # Requests instrumentation
            RequestsInstrumentor().instrument()
            self.instrumentors.append("requests")
            
            # SQLAlchemy instrumentation
            SQLAlchemyInstrumentor().instrument()
            self.instrumentors.append("sqlalchemy")
            
            # Redis instrumentation
            RedisInstrumentor().instrument()
            self.instrumentors.append("redis")
            
            logger.info(f"Auto-instrumentation enabled for: {', '.join(self.instrumentors)}")
            
        except Exception as e:
            logger.warning(f"Some auto-instrumentation failed: {str(e)}")
    
    @contextmanager
    def trace_operation(self, name: str, **attributes):
        """Context manager for tracing operations"""
        with self.tracer.start_as_current_span(name) as span:
            try:
                # Set custom attributes
                for key, value in attributes.items():
                    span.set_attribute(key, str(value))
                
                # Record start time
                start_time = time.time()
                span.set_attribute("operation.start_time", start_time)
                
                yield span
                
                # Record duration
                duration = time.time() - start_time
                span.set_attribute("operation.duration_ms", duration * 1000)
                
                # Mark as successful
                if OPENTELEMETRY_AVAILABLE:
                    span.set_status(Status(StatusCode.OK))
                
            except Exception as e:
                # Record exception
                if OPENTELEMETRY_AVAILABLE:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                
                # Track error
                if self.config.enable_error_tracking:
                    self.trace_analytics.record_error(name, str(e))
                
                raise
            finally:
                # Track performance
                if self.config.enable_performance_tracking:
                    end_time = time.time()
                    duration = end_time - start_time
                    self.trace_analytics.record_performance(name, duration)
    
    @asynccontextmanager
    async def trace_async_operation(self, name: str, **attributes):
        """Async context manager for tracing operations"""
        with self.tracer.start_as_current_span(name) as span:
            try:
                # Set custom attributes
                for key, value in attributes.items():
                    span.set_attribute(key, str(value))
                
                # Record start time
                start_time = time.time()
                span.set_attribute("operation.start_time", start_time)
                
                yield span
                
                # Record duration
                duration = time.time() - start_time
                span.set_attribute("operation.duration_ms", duration * 1000)
                
                # Mark as successful
                if OPENTELEMETRY_AVAILABLE:
                    span.set_status(Status(StatusCode.OK))
                
            except Exception as e:
                # Record exception
                if OPENTELEMETRY_AVAILABLE:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                
                # Track error
                if self.config.enable_error_tracking:
                    self.trace_analytics.record_error(name, str(e))
                
                raise
            finally:
                # Track performance
                if self.config.enable_performance_tracking:
                    end_time = time.time()
                    duration = end_time - start_time
                    self.trace_analytics.record_performance(name, duration)
    
    def trace_function(self, operation_name: str = None, **trace_attributes):
        """Decorator for tracing functions"""
        def decorator(func):
            nonlocal operation_name
            if operation_name is None:
                operation_name = f"{func.__module__}.{func.__qualname__}"
            
            if asyncio.iscoroutinefunction(func):
                @wraps(func)
                async def async_wrapper(*args, **kwargs):
                    async with self.trace_async_operation(operation_name, **trace_attributes) as span:
                        # Add function-specific attributes
                        span.set_attribute("function.name", func.__name__)
                        span.set_attribute("function.module", func.__module__)
                        
                        result = await func(*args, **kwargs)
                        return result
                return async_wrapper
            else:
                @wraps(func)
                def sync_wrapper(*args, **kwargs):
                    with self.trace_operation(operation_name, **trace_attributes) as span:
                        # Add function-specific attributes
                        span.set_attribute("function.name", func.__name__)
                        span.set_attribute("function.module", func.__module__)
                        
                        result = func(*args, **kwargs)
                        return result
                return sync_wrapper
        return decorator
    
    def trace_vin_operation(self, vin: str, operation: str):
        """Specialized tracing for VIN operations"""
        return self.trace_operation(
            f"vin.{operation}",
            vin_partial=vin[:8] + "***" if len(vin) >= 8 else vin,
            operation_type="vin_processing"
        )
    
    def trace_telematics_operation(self, provider: str, operation: str):
        """Specialized tracing for telematics operations"""
        return self.trace_operation(
            f"telematics.{operation}",
            provider=provider,
            operation_type="telematics"
        )
    
    def trace_ml_operation(self, model_name: str, operation: str):
        """Specialized tracing for ML operations"""
        return self.trace_operation(
            f"ml.{operation}",
            model_name=model_name,
            operation_type="machine_learning"
        )
    
    def trace_security_operation(self, threat_type: str, operation: str):
        """Specialized tracing for security operations"""
        return self.trace_operation(
            f"security.{operation}",
            threat_type=threat_type,
            operation_type="security"
        )
    
    def get_current_trace_id(self) -> Optional[str]:
        """Get current trace ID"""
        if not OPENTELEMETRY_AVAILABLE:
            return None
        
        current_span = trace.get_current_span()
        if current_span and current_span.is_recording():
            return format(current_span.get_span_context().trace_id, '032x')
        return None
    
    def get_current_span_id(self) -> Optional[str]:
        """Get current span ID"""
        if not OPENTELEMETRY_AVAILABLE:
            return None
        
        current_span = trace.get_current_span()
        if current_span and current_span.is_recording():
            return format(current_span.get_span_context().span_id, '016x')
        return None
    
    def inject_trace_context(self, headers: Dict[str, str]) -> Dict[str, str]:
        """Inject trace context into headers for propagation"""
        if not OPENTELEMETRY_AVAILABLE:
            return headers
        
        inject(headers)
        return headers
    
    def extract_trace_context(self, headers: Dict[str, str]):
        """Extract trace context from headers"""
        if not OPENTELEMETRY_AVAILABLE:
            return
        
        extract(headers)

class TraceAnalytics:
    """Analytics and monitoring for distributed traces"""
    
    def __init__(self):
        self.performance_metrics = {}
        self.error_metrics = {}
        self.operation_counts = {}
        self.slow_operations = []
        
    def record_performance(self, operation: str, duration: float):
        """Record performance metrics for operations"""
        if operation not in self.performance_metrics:
            self.performance_metrics[operation] = {
                'count': 0,
                'total_duration': 0.0,
                'min_duration': float('inf'),
                'max_duration': 0.0,
                'durations': []
            }
        
        metrics = self.performance_metrics[operation]
        metrics['count'] += 1
        metrics['total_duration'] += duration
        metrics['min_duration'] = min(metrics['min_duration'], duration)
        metrics['max_duration'] = max(metrics['max_duration'], duration)
        metrics['durations'].append(duration)
        
        # Keep only recent durations for percentile calculations
        if len(metrics['durations']) > 1000:
            metrics['durations'] = metrics['durations'][-1000:]
        
        # Track slow operations
        if duration > 1.0:  # 1 second threshold
            self.slow_operations.append({
                'operation': operation,
                'duration': duration,
                'timestamp': datetime.now()
            })
            
            # Keep only recent slow operations
            if len(self.slow_operations) > 100:
                self.slow_operations = self.slow_operations[-100:]
    
    def record_error(self, operation: str, error: str):
        """Record error metrics for operations"""
        if operation not in self.error_metrics:
            self.error_metrics[operation] = {
                'count': 0,
                'errors': {}
            }
        
        self.error_metrics[operation]['count'] += 1
        
        if error not in self.error_metrics[operation]['errors']:
            self.error_metrics[operation]['errors'][error] = 0
        self.error_metrics[operation]['errors'][error] += 1
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for all operations"""
        summary = {}
        
        for operation, metrics in self.performance_metrics.items():
            if metrics['count'] > 0:
                avg_duration = metrics['total_duration'] / metrics['count']
                
                # Calculate percentiles
                durations = sorted(metrics['durations'])
                p50 = durations[len(durations) // 2] if durations else 0
                p95_idx = int(len(durations) * 0.95)
                p95 = durations[p95_idx] if durations and p95_idx < len(durations) else 0
                p99_idx = int(len(durations) * 0.99)
                p99 = durations[p99_idx] if durations and p99_idx < len(durations) else 0
                
                summary[operation] = {
                    'count': metrics['count'],
                    'avg_duration_ms': avg_duration * 1000,
                    'min_duration_ms': metrics['min_duration'] * 1000,
                    'max_duration_ms': metrics['max_duration'] * 1000,
                    'p50_duration_ms': p50 * 1000,
                    'p95_duration_ms': p95 * 1000,
                    'p99_duration_ms': p99 * 1000
                }
        
        return summary
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get error summary for all operations"""
        summary = {}
        
        for operation, metrics in self.error_metrics.items():
            summary[operation] = {
                'total_errors': metrics['count'],
                'error_types': metrics['errors']
            }
        
        return summary
    
    def get_slow_operations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get slowest operations"""
        return sorted(
            self.slow_operations,
            key=lambda x: x['duration'],
            reverse=True
        )[:limit]

class ServiceDependencyMapper:
    """Maps service dependencies based on trace data"""
    
    def __init__(self):
        self.dependencies = {}
        self.service_calls = {}
        
    def record_service_call(self, from_service: str, to_service: str, operation: str, duration: float, success: bool):
        """Record a service-to-service call"""
        if from_service not in self.dependencies:
            self.dependencies[from_service] = set()
        self.dependencies[from_service].add(to_service)
        
        call_key = f"{from_service}->{to_service}"
        if call_key not in self.service_calls:
            self.service_calls[call_key] = {
                'count': 0,
                'total_duration': 0.0,
                'success_count': 0,
                'operations': set()
            }
        
        call_data = self.service_calls[call_key]
        call_data['count'] += 1
        call_data['total_duration'] += duration
        call_data['operations'].add(operation)
        
        if success:
            call_data['success_count'] += 1
    
    def get_dependency_map(self) -> Dict[str, Any]:
        """Get complete service dependency map"""
        dependency_map = {}
        
        for from_service, to_services in self.dependencies.items():
            dependency_map[from_service] = {
                'dependencies': list(to_services),
                'call_stats': {}
            }
            
            for to_service in to_services:
                call_key = f"{from_service}->{to_service}"
                if call_key in self.service_calls:
                    call_data = self.service_calls[call_key]
                    dependency_map[from_service]['call_stats'][to_service] = {
                        'call_count': call_data['count'],
                        'avg_duration_ms': (call_data['total_duration'] / call_data['count']) * 1000,
                        'success_rate': call_data['success_count'] / call_data['count'],
                        'operations': list(call_data['operations'])
                    }
        
        return dependency_map

class CustomSpanProcessor:
    """Custom span processor for additional trace processing"""
    
    def __init__(self, tracing_manager: TracingManager):
        self.tracing_manager = tracing_manager
        self.service_mapper = ServiceDependencyMapper()
    
    def on_start(self, span, parent_context):
        """Called when span starts"""
        pass
    
    def on_end(self, span):
        """Called when span ends"""
        if not span.is_recording():
            return
        
        # Extract span data
        span_name = span.name
        duration = (span.end_time - span.start_time) / 1_000_000_000  # Convert to seconds
        status = span.status
        attributes = span.attributes or {}
        
        # Record in analytics
        self.tracing_manager.trace_analytics.record_performance(span_name, duration)
        
        if status and hasattr(status, 'status_code') and status.status_code == StatusCode.ERROR:
            error_msg = status.description or "Unknown error"
            self.tracing_manager.trace_analytics.record_error(span_name, error_msg)
        
        # Record service dependencies
        service_name = attributes.get('service.name', 'unknown')
        target_service = attributes.get('target.service', 'unknown')
        
        if service_name != 'unknown' and target_service != 'unknown':
            success = status is None or (hasattr(status, 'status_code') and status.status_code == StatusCode.OK)
            self.service_mapper.record_service_call(
                service_name, target_service, span_name, duration, success
            )

# Global tracing manager
_tracing_manager = None

def get_tracing_manager() -> TracingManager:
    """Get global tracing manager instance"""
    global _tracing_manager
    if _tracing_manager is None:
        _tracing_manager = TracingManager()
    return _tracing_manager

def initialize_tracing(config: TraceConfig = None):
    """Initialize distributed tracing system"""
    global _tracing_manager
    _tracing_manager = TracingManager(config)
    return _tracing_manager

# Convenience decorators and functions
def trace_operation(name: str = None, **attributes):
    """Decorator for tracing operations"""
    manager = get_tracing_manager()
    return manager.trace_function(name, **attributes)

def trace_vin_operation(operation: str):
    """Decorator for VIN operations"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            vin = kwargs.get('vin') or (args[0] if args else 'unknown')
            manager = get_tracing_manager()
            
            if asyncio.iscoroutinefunction(func):
                async with manager.trace_vin_operation(vin, operation):
                    return await func(*args, **kwargs)
            else:
                with manager.trace_vin_operation(vin, operation):
                    return func(*args, **kwargs)
        return wrapper
    return decorator

def trace_ml_operation(model_name: str, operation: str):
    """Decorator for ML operations"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            manager = get_tracing_manager()
            
            if asyncio.iscoroutinefunction(func):
                async with manager.trace_ml_operation(model_name, operation):
                    return await func(*args, **kwargs)
            else:
                with manager.trace_ml_operation(model_name, operation):
                    return func(*args, **kwargs)
        return wrapper
    return decorator

def trace_security_operation(threat_type: str, operation: str):
    """Decorator for security operations"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            manager = get_tracing_manager()
            
            if asyncio.iscoroutinefunction(func):
                async with manager.trace_security_operation(threat_type, operation):
                    return await func(*args, **kwargs)
            else:
                with manager.trace_security_operation(threat_type, operation):
                    return func(*args, **kwargs)
        return wrapper
    return decorator

def get_current_trace_context() -> Dict[str, Optional[str]]:
    """Get current trace context information"""
    manager = get_tracing_manager()
    return {
        'trace_id': manager.get_current_trace_id(),
        'span_id': manager.get_current_span_id()
    }

def create_child_span(name: str, **attributes):
    """Create a child span of the current span"""
    manager = get_tracing_manager()
    return manager.trace_operation(name, **attributes)