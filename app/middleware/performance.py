"""
Performance Monitoring and Caching for GIU EV Charging Infrastructure

This module provides:
- Redis-based caching for VIN decoding and API responses
- Prometheus metrics collection
- Circuit breaker patterns for external API calls
- Performance monitoring and alerting
"""

import time
import json
import hashlib
import asyncio
from typing import Dict, Any, Optional, Union, Callable
from datetime import datetime, timedelta
from functools import wraps
import structlog
from fastapi import Request, Response

# Import middleware with fallback
try:
    from fastapi.middleware.base import BaseHTTPMiddleware
except ImportError:
    try:
        from starlette.middleware.base import BaseHTTPMiddleware
    except ImportError:
        # Create a simple fallback middleware base
        class BaseHTTPMiddleware:
            def __init__(self, app):
                self.app = app

# Import Redis with fallback
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    print("⚠️  Redis not available - caching disabled")
    REDIS_AVAILABLE = False
    redis = None

# Import Prometheus with fallback
try:
    from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry
    PROMETHEUS_AVAILABLE = True
except ImportError:
    print("⚠️  Prometheus client not available - metrics disabled")
    PROMETHEUS_AVAILABLE = False
    # Create fallback classes
    class Counter:
        def __init__(self, *args, **kwargs):
            pass
        def labels(self, **kwargs):
            return self
        def inc(self):
            pass
    
    class Histogram:
        def __init__(self, *args, **kwargs):
            pass
        def labels(self, **kwargs):
            return self
        def observe(self, value):
            pass
    
    class Gauge:
        def __init__(self, *args, **kwargs):
            pass
        def labels(self, **kwargs):
            return self
        def set(self, value):
            pass
        def inc(self):
            pass
        def dec(self):
            pass
        @property
        def _value(self):
            return MockValue()
    
    class MockValue:
        def get(self):
            return 0
    
    class CollectorRegistry:
        def __init__(self):
            pass

# Import circuit breaker with fallback
try:
    import circuit_breaker
    CIRCUIT_BREAKER_AVAILABLE = True
except ImportError:
    print("⚠️  Circuit breaker not available")
    CIRCUIT_BREAKER_AVAILABLE = False
    
    # Create fallback circuit breaker
    class MockCircuitBreaker:
        def __init__(self, *args, **kwargs):
            pass
        
        def __call__(self, func):
            return func
        
        @property
        def current_state(self):
            return "closed"
    
    class circuit_breaker:
        CircuitBreaker = MockCircuitBreaker
        CircuitBreakerError = Exception

# Initialize logger
perf_logger = structlog.get_logger("performance")

class PerformanceConfig:
    """Performance and caching configuration"""
    
    # Redis configuration
    REDIS_HOST = "localhost"
    REDIS_PORT = 6379
    REDIS_DB = 0
    REDIS_PASSWORD = None
    
    # Cache TTL settings (in seconds)
    VIN_DECODE_TTL = 3600  # 1 hour
    PROVIDER_CONFIG_TTL = 1800  # 30 minutes
    API_RESPONSE_TTL = 300  # 5 minutes
    FLEET_INSIGHTS_TTL = 60  # 1 minute
    
    # Circuit breaker settings
    CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT = 60
    CIRCUIT_BREAKER_EXPECTED_EXCEPTION = Exception
    
    # Performance monitoring thresholds
    SLOW_REQUEST_THRESHOLD = 1.0  # seconds
    HIGH_MEMORY_THRESHOLD = 500 * 1024 * 1024  # 500MB
    HIGH_CPU_THRESHOLD = 80.0  # percentage

class RedisCache:
    """Redis-based caching system with automatic serialization"""
    
    def __init__(self, config: PerformanceConfig = None):
        self.config = config or PerformanceConfig()
        self._redis_client = None
        self._connection_attempts = 0
        self._max_connection_attempts = 3
        
    @property
    def redis_client(self):
        """Get Redis client with connection retry logic"""
        if not REDIS_AVAILABLE:
            return None
            
        if self._redis_client is None:
            try:
                self._redis_client = redis.Redis(
                    host=self.config.REDIS_HOST,
                    port=self.config.REDIS_PORT,
                    db=self.config.REDIS_DB,
                    password=self.config.REDIS_PASSWORD,
                    decode_responses=True,
                    socket_timeout=5,
                    socket_connect_timeout=5,
                    retry_on_timeout=True
                )
                # Test connection
                self._redis_client.ping()
                perf_logger.info("Redis connection established")
                self._connection_attempts = 0
            except Exception as e:
                self._connection_attempts += 1
                perf_logger.warning(
                    "Redis connection failed",
                    attempt=self._connection_attempts,
                    error=str(e)
                )
                if self._connection_attempts < self._max_connection_attempts:
                    return None
                else:
                    perf_logger.error("Redis connection failed after max attempts")
                    return None
        
        return self._redis_client
    
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a consistent cache key"""
        key_data = f"{prefix}:{':'.join(map(str, args))}"
        if kwargs:
            key_data += f":{hashlib.md5(json.dumps(kwargs, sort_keys=True).encode()).hexdigest()}"
        return key_data
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache with automatic deserialization"""
        if not self.redis_client:
            return None
        
        try:
            cached_value = self.redis_client.get(key)
            if cached_value:
                return json.loads(cached_value)
        except Exception as e:
            perf_logger.warning("Cache get error", key=key, error=str(e))
        
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with automatic serialization"""
        if not self.redis_client:
            return False
        
        try:
            serialized_value = json.dumps(value, default=str)
            return self.redis_client.setex(key, ttl, serialized_value)
        except Exception as e:
            perf_logger.warning("Cache set error", key=key, error=str(e))
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            perf_logger.warning("Cache delete error", key=key, error=str(e))
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.redis_client:
            return {"status": "disconnected"}
        
        try:
            info = self.redis_client.info()
            return {
                "status": "connected",
                "used_memory": info.get("used_memory_human", "unknown"),
                "connected_clients": info.get("connected_clients", 0),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": (
                    info.get("keyspace_hits", 0) / 
                    max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1)
                ) * 100
            }
        except Exception as e:
            perf_logger.warning("Cache stats error", error=str(e))
            return {"status": "error", "error": str(e)}

class PrometheusMetrics:
    """Prometheus metrics collection"""
    
    def __init__(self, registry: CollectorRegistry = None):
        if PROMETHEUS_AVAILABLE:
            self.registry = registry or CollectorRegistry()
        else:
            self.registry = CollectorRegistry()
        
        # HTTP request metrics
        self.http_requests_total = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status_code'],
            registry=self.registry
        )
        
        self.http_request_duration = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'endpoint'],
            registry=self.registry
        )
        
        # VIN processing metrics
        self.vin_decodes_total = Counter(
            'vin_decodes_total',
            'Total VIN decode attempts',
            ['manufacturer', 'success'],
            registry=self.registry
        )
        
        self.vin_decode_duration = Histogram(
            'vin_decode_duration_seconds',
            'VIN decode duration in seconds',
            registry=self.registry
        )
        
        # Telematics metrics
        self.telematics_connections_total = Counter(
            'telematics_connections_total',
            'Total telematics connection attempts',
            ['provider', 'success'],
            registry=self.registry
        )
        
        # Cache metrics
        self.cache_operations_total = Counter(
            'cache_operations_total',
            'Total cache operations',
            ['operation', 'success'],
            registry=self.registry
        )
        
        self.cache_hit_rate = Gauge(
            'cache_hit_rate_percent',
            'Cache hit rate percentage',
            registry=self.registry
        )
        
        # System metrics
        self.active_requests = Gauge(
            'active_requests',
            'Number of active requests',
            registry=self.registry
        )
        
        self.circuit_breaker_state = Gauge(
            'circuit_breaker_state',
            'Circuit breaker state (0=closed, 1=open, 2=half-open)',
            ['service'],
            registry=self.registry
        )

class CircuitBreakerManager:
    """Manage circuit breakers for external services"""
    
    def __init__(self, config: PerformanceConfig = None):
        self.config = config or PerformanceConfig()
        self.circuit_breakers: Dict[str, Any] = {}
        self.metrics = PrometheusMetrics()
    
    def get_circuit_breaker(self, service_name: str):
        """Get or create circuit breaker for service"""
        if service_name not in self.circuit_breakers:
            if CIRCUIT_BREAKER_AVAILABLE:
                cb = circuit_breaker.CircuitBreaker(
                    failure_threshold=self.config.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                    recovery_timeout=self.config.CIRCUIT_BREAKER_RECOVERY_TIMEOUT,
                    expected_exception=self.config.CIRCUIT_BREAKER_EXPECTED_EXCEPTION
                )
            else:
                cb = circuit_breaker.CircuitBreaker()
            
            self.circuit_breakers[service_name] = cb
            
            # Update metrics
            self.metrics.circuit_breaker_state.labels(service=service_name).set(0)
        
        return self.circuit_breakers[service_name]
    
    def call_external_service(self, service_name: str, func: Callable, *args, **kwargs):
        """Call external service through circuit breaker"""
        cb = self.get_circuit_breaker(service_name)
        
        try:
            result = cb(func)(*args, **kwargs)
            # Update circuit breaker state metric
            if cb.current_state == "closed":
                self.metrics.circuit_breaker_state.labels(service=service_name).set(0)
            elif cb.current_state == "open":
                self.metrics.circuit_breaker_state.labels(service=service_name).set(1)
            else:  # half-open
                self.metrics.circuit_breaker_state.labels(service=service_name).set(2)
            
            return result
        except Exception as e:
            if CIRCUIT_BREAKER_AVAILABLE and isinstance(e, circuit_breaker.CircuitBreakerError):
                perf_logger.warning("Circuit breaker open", service=service_name)
                self.metrics.circuit_breaker_state.labels(service=service_name).set(1)
            else:
                perf_logger.error("External service error", service=service_name, error=str(e))
            raise

class PerformanceMiddleware(BaseHTTPMiddleware):
    """Performance monitoring middleware"""
    
    def __init__(self, app, config: PerformanceConfig = None):
        super().__init__(app)
        self.config = config or PerformanceConfig()
        self.metrics = PrometheusMetrics()
        self.cache = RedisCache(config)
        self.circuit_breaker_manager = CircuitBreakerManager(config)
        
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Increment active requests
        self.metrics.active_requests.inc()
        
        # Extract endpoint info
        method = request.method
        endpoint = self._get_endpoint_label(request.url.path)
        
        try:
            # Process request
            response = await call_next(request)
            
            # Record metrics
            processing_time = time.time() - start_time
            status_code = str(response.status_code)
            
            self.metrics.http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()
            
            self.metrics.http_request_duration.labels(
                method=method,
                endpoint=endpoint
            ).observe(processing_time)
            
            # Log slow requests
            if processing_time > self.config.SLOW_REQUEST_THRESHOLD:
                perf_logger.warning(
                    "slow_request",
                    method=method,
                    endpoint=endpoint,
                    duration=processing_time,
                    status_code=status_code
                )
            
            return response
            
        except Exception as e:
            # Record error metrics
            self.metrics.http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status_code="500"
            ).inc()
            
            perf_logger.error(
                "request_error",
                method=method,
                endpoint=endpoint,
                error=str(e)
            )
            raise
        finally:
            # Decrement active requests
            self.metrics.active_requests.dec()
    
    def _get_endpoint_label(self, path: str) -> str:
        """Get normalized endpoint label for metrics"""
        # Normalize paths for better metrics grouping
        if path.startswith("/api/v1/vin-telematics"):
            return "/api/v1/vin-telematics"
        elif path.startswith("/api/ml"):
            return "/api/ml"
        elif path.startswith("/api/dashboard"):
            return "/api/dashboard"
        elif path.startswith("/health"):
            return "/health"
        else:
            return "/other"

# Caching decorators
def cache_response(cache_key_prefix: str, ttl: int = 300):
    """Decorator to cache function responses"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = RedisCache()
            
            # Generate cache key
            cache_key = cache._generate_cache_key(cache_key_prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                # Note: metrics might not be available
                try:
                    cache.metrics.cache_operations_total.labels(
                        operation="hit", success="true"
                    ).inc()
                except:
                    pass
                return cached_result
            
            # Cache miss - call function
            try:
                result = await func(*args, **kwargs)
                
                # Cache the result
                cache.set(cache_key, result, ttl)
                try:
                    cache.metrics.cache_operations_total.labels(
                        operation="miss", success="true"
                    ).inc()
                except:
                    pass
                
                return result
            except Exception as e:
                try:
                    cache.metrics.cache_operations_total.labels(
                        operation="miss", success="false"
                    ).inc()
                except:
                    pass
                raise
        
        return wrapper
    return decorator

def cache_vin_decode(ttl: int = 3600):
    """Decorator specifically for VIN decoding cache"""
    return cache_response("vin_decode", ttl)

def cache_fleet_insights(ttl: int = 60):
    """Decorator for fleet insights cache"""
    return cache_response("fleet_insights", ttl)

# Performance monitoring utilities
class PerformanceMonitor:
    """Utility class for performance monitoring"""
    
    def __init__(self):
        self.metrics = PrometheusMetrics()
        self.cache = RedisCache()
    
    def record_vin_decode(self, manufacturer: str, success: bool, duration: float):
        """Record VIN decode metrics"""
        self.metrics.vin_decodes_total.labels(
            manufacturer=manufacturer,
            success=str(success)
        ).inc()
        
        self.metrics.vin_decode_duration.observe(duration)
    
    def record_telematics_connection(self, provider: str, success: bool):
        """Record telematics connection metrics"""
        self.metrics.telematics_connections_total.labels(
            provider=provider,
            success=str(success)
        ).inc()
    
    def update_cache_metrics(self):
        """Update cache hit rate metrics"""
        try:
            stats = self.cache.get_stats()
            if "hit_rate" in stats:
                self.metrics.cache_hit_rate.set(stats["hit_rate"])
        except Exception:
            pass
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        try:
            cache_stats = self.cache.get_stats()
        except Exception:
            cache_stats = {"status": "error"}
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "cache": cache_stats,
            "system": {
                "active_requests": self.metrics.active_requests._value.get(),
            },
            "thresholds": {
                "slow_request_threshold": PerformanceConfig.SLOW_REQUEST_THRESHOLD,
                "high_memory_threshold": PerformanceConfig.HIGH_MEMORY_THRESHOLD,
                "high_cpu_threshold": PerformanceConfig.HIGH_CPU_THRESHOLD
            }
        }

# Global instances
performance_monitor = PerformanceMonitor()
cache = RedisCache()
circuit_breaker_manager = CircuitBreakerManager() 