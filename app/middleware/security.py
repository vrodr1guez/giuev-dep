"""
Security Middleware for GIU EV Charging Infrastructure

This module provides comprehensive security features including:
- Rate limiting with slowapi
- Input sanitization and validation
- Audit logging with structured logging
- Enhanced CORS protection
- Request/response security headers
"""

import time
import json
import re
from typing import Dict, Any, Optional
from fastapi import Request, Response, HTTPException

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

# Import rate limiting with fallback
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    RATE_LIMITING_AVAILABLE = True
    
    # Initialize rate limiter
    limiter = Limiter(key_func=get_remote_address)
except ImportError:
    print("⚠️  Slowapi not available - rate limiting disabled")
    RATE_LIMITING_AVAILABLE = False
    limiter = None
    RateLimitExceeded = Exception

# Import structured logging with fallback
try:
    import structlog
    STRUCTLOG_AVAILABLE = True
    audit_logger = structlog.get_logger("audit")
    security_logger = structlog.get_logger("security")
except ImportError:
    print("⚠️  Structlog not available - using standard logging")
    import logging
    STRUCTLOG_AVAILABLE = False
    audit_logger = logging.getLogger("audit")
    security_logger = logging.getLogger("security")

# Import input sanitization with fallback
try:
    import bleach
    BLEACH_AVAILABLE = True
except ImportError:
    print("⚠️  Bleach not available - basic sanitization only")
    BLEACH_AVAILABLE = False

try:
    from ipaddress import ip_address, AddressValueError
    IPADDRESS_AVAILABLE = True
except ImportError:
    print("⚠️  ipaddress not available - IP validation disabled")
    IPADDRESS_AVAILABLE = False

class SecurityConfig:
    """Security configuration settings"""
    
    # Rate limiting settings
    GLOBAL_RATE_LIMIT = "100/minute"  # Global requests per minute
    VIN_ANALYSIS_RATE_LIMIT = "10/minute"  # VIN analysis specific
    TELEMATICS_CONNECTION_RATE_LIMIT = "5/minute"  # Connection attempts
    
    # Input validation settings
    MAX_REQUEST_SIZE = 1024 * 1024  # 1MB max request size
    ALLOWED_CONTENT_TYPES = [
        "application/json",
        "application/x-www-form-urlencoded",
        "multipart/form-data"
    ]
    
    # Security headers
    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }
    
    # CORS settings
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://giu-ev-charging.vercel.app"  # Production frontend
    ]
    
    # Blocked IP patterns (disabled for development)
    BLOCKED_IP_RANGES = []  # Empty for development

class InputSanitizer:
    """Comprehensive input sanitization and validation"""
    
    @staticmethod
    def sanitize_vin(vin: str) -> str:
        """Sanitize and validate VIN input"""
        if not vin:
            raise HTTPException(status_code=400, detail="VIN cannot be empty")
        
        # Remove any non-alphanumeric characters
        sanitized = re.sub(r'[^A-Z0-9]', '', vin.upper().strip())
        
        # Validate length
        if len(sanitized) != 17:
            raise HTTPException(status_code=400, detail="VIN must be exactly 17 characters")
        
        # Check for invalid characters (I, O, Q not allowed in VINs)
        if re.search(r'[IOQ]', sanitized):
            raise HTTPException(status_code=400, detail="VIN contains invalid characters (I, O, Q)")
        
        return sanitized
    
    @staticmethod
    def sanitize_json_input(data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize JSON input data"""
        sanitized = {}
        
        for key, value in data.items():
            # Sanitize key
            clean_key = InputSanitizer._clean_string(str(key))
            
            # Sanitize value based on type
            if isinstance(value, str):
                clean_value = InputSanitizer._clean_string(value)
                if len(clean_value) > 1000:  # Reasonable limit
                    clean_value = clean_value[:1000]
                sanitized[clean_key] = clean_value
            elif isinstance(value, (int, float, bool)):
                sanitized[clean_key] = value
            elif isinstance(value, dict):
                sanitized[clean_key] = InputSanitizer.sanitize_json_input(value)
            elif isinstance(value, list):
                sanitized[clean_key] = [
                    InputSanitizer.sanitize_json_input(item) if isinstance(item, dict)
                    else InputSanitizer._clean_string(str(item)) if isinstance(item, str)
                    else item
                    for item in value[:100]  # Limit list size
                ]
            else:
                # Convert unknown types to string and sanitize
                sanitized[clean_key] = InputSanitizer._clean_string(str(value))
        
        return sanitized
    
    @staticmethod
    def _clean_string(value: str) -> str:
        """Clean string with or without bleach"""
        if BLEACH_AVAILABLE:
            return bleach.clean(value, tags=[], strip=True)
        else:
            # Basic cleaning without bleach
            # Remove HTML-like tags
            value = re.sub(r'<[^>]*>', '', value)
            # Remove script content
            value = re.sub(r'<script.*?</script>', '', value, flags=re.IGNORECASE | re.DOTALL)
            # Remove javascript: urls
            value = re.sub(r'javascript:', '', value, flags=re.IGNORECASE)
            return value.strip()
    
    @staticmethod
    def validate_ip_address(ip: str) -> bool:
        """Validate and check if IP address is allowed"""
        if not IPADDRESS_AVAILABLE:
            return True  # Allow all if ipaddress module not available
        
        try:
            client_ip = ip_address(ip)
            
            # Check against blocked ranges
            for blocked_range in SecurityConfig.BLOCKED_IP_RANGES:
                if client_ip in ip_address(blocked_range.split('/')[0]):
                    return False
            
            return True
        except (AddressValueError, ValueError):
            return True  # Allow if we can't parse

class AuditLogger:
    """Structured audit logging for security events"""
    
    @staticmethod
    def log_request(request: Request, response_status: int, processing_time: float):
        """Log API request for audit trail"""
        if STRUCTLOG_AVAILABLE:
            audit_logger.info(
                "api_request",
                method=request.method,
                url=str(request.url),
                client_ip=request.client.host if request.client else "unknown",
                user_agent=request.headers.get("user-agent", "unknown"),
                status_code=response_status,
                processing_time_ms=round(processing_time * 1000, 2),
                timestamp=time.time()
            )
        else:
            audit_logger.info(
                f"API Request: {request.method} {request.url} - {response_status} - {processing_time:.3f}s"
            )
    
    @staticmethod
    def log_security_event(event_type: str, details: Dict[str, Any], request: Request):
        """Log security-related events"""
        if STRUCTLOG_AVAILABLE:
            security_logger.warning(
                "security_event",
                event_type=event_type,
                details=details,
                client_ip=request.client.host if request.client else "unknown",
                user_agent=request.headers.get("user-agent", "unknown"),
                url=str(request.url),
                timestamp=time.time()
            )
        else:
            security_logger.warning(
                f"Security Event: {event_type} - {details} - {request.url}"
            )
    
    @staticmethod
    def log_telematics_connection(vin: str, provider: str, success: bool, user_id: Optional[str], request: Request):
        """Log telematics connection attempts"""
        if STRUCTLOG_AVAILABLE:
            audit_logger.info(
                "telematics_connection",
                vin=vin[:8] + "***" + vin[-4:],  # Partially mask VIN for privacy
                provider=provider,
                success=success,
                user_id=user_id,
                client_ip=request.client.host if request.client else "unknown",
                timestamp=time.time()
            )
        else:
            audit_logger.info(
                f"Telematics Connection: {vin[:8]}*** - {provider} - Success: {success}"
            )

class SecurityMiddleware(BaseHTTPMiddleware):
    """Comprehensive security middleware"""
    
    def __init__(self, app, config: SecurityConfig = None):
        super().__init__(app)
        self.config = config or SecurityConfig()
        self.input_sanitizer = InputSanitizer()
        self.audit_logger = AuditLogger()
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            # Security validations
            await self._validate_request_security(request)
            
            # Process request
            response = await call_next(request)
            
            # Add security headers
            self._add_security_headers(response)
            
            # Log request for audit
            processing_time = time.time() - start_time
            self.audit_logger.log_request(request, response.status_code, processing_time)
            
            return response
        except Exception as e:
            # Create error response
            from fastapi.responses import JSONResponse
            error_response = JSONResponse(
                status_code=500,
                content={"error": "Internal server error", "message": str(e)}
            )
            self._add_security_headers(error_response)
            return error_response
    
    async def _validate_request_security(self, request: Request):
        """Perform comprehensive security validation"""
        
        # 1. Validate IP address
        client_ip = request.client.host if request.client else "unknown"
        if not self.input_sanitizer.validate_ip_address(client_ip):
            self.audit_logger.log_security_event(
                "blocked_ip_attempt",
                {"ip": client_ip, "reason": "IP in blocked range"},
                request
            )
            raise HTTPException(status_code=403, detail="Access denied")
        
        # 2. Validate request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.config.MAX_REQUEST_SIZE:
            self.audit_logger.log_security_event(
                "request_too_large",
                {"size": content_length, "max_allowed": self.config.MAX_REQUEST_SIZE},
                request
            )
            raise HTTPException(status_code=413, detail="Request too large")
        
        # 3. Validate content type for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "").split(";")[0]
            if content_type and content_type not in self.config.ALLOWED_CONTENT_TYPES:
                self.audit_logger.log_security_event(
                    "invalid_content_type",
                    {"content_type": content_type},
                    request
                )
                raise HTTPException(status_code=415, detail="Unsupported media type")
        
        # 4. Check for suspicious patterns in URL
        suspicious_patterns = [
            r'\.\./.*',  # Directory traversal
            r'<script.*?>',  # XSS attempts
            r'union\s+select',  # SQL injection
            r'javascript:',  # JavaScript injection
        ]
        
        url_path = str(request.url.path).lower()
        for pattern in suspicious_patterns:
            if re.search(pattern, url_path, re.IGNORECASE):
                self.audit_logger.log_security_event(
                    "suspicious_url_pattern",
                    {"pattern": pattern, "url": url_path},
                    request
                )
                raise HTTPException(status_code=400, detail="Invalid request")
    
    def _add_security_headers(self, response: Response):
        """Add security headers to response"""
        for header, value in self.config.SECURITY_HEADERS.items():
            response.headers[header] = value

class VINSecurityValidator:
    """Specialized security validator for VIN operations"""
    
    @staticmethod
    def validate_vin_request(vin: str, request: Request) -> str:
        """Validate VIN with security checks"""
        # Sanitize VIN
        sanitized_vin = InputSanitizer.sanitize_vin(vin)
        
        # Additional VIN-specific security checks
        if len(set(sanitized_vin)) < 5:  # Too many repeated characters
            AuditLogger.log_security_event(
                "suspicious_vin_pattern",
                {"vin": sanitized_vin[:8] + "***", "reason": "too_many_repeated_characters"},
                request
            )
            raise HTTPException(status_code=400, detail="Invalid VIN pattern")
        
        return sanitized_vin

# Rate limiting decorators for specific endpoints
def vin_analysis_rate_limit():
    """Rate limit for VIN analysis endpoints"""
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(SecurityConfig.VIN_ANALYSIS_RATE_LIMIT)
    else:
        # Return a no-op decorator if rate limiting not available
        def decorator(func):
            return func
        return decorator

def telematics_connection_rate_limit():
    """Rate limit for telematics connection endpoints"""
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(SecurityConfig.TELEMATICS_CONNECTION_RATE_LIMIT)
    else:
        def decorator(func):
            return func
        return decorator

def global_rate_limit():
    """Global rate limit for all endpoints"""
    if RATE_LIMITING_AVAILABLE:
        return limiter.limit(SecurityConfig.GLOBAL_RATE_LIMIT)
    else:
        def decorator(func):
            return func
        return decorator

# Initialize rate limit exceeded handler
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom rate limit exceeded handler"""
    if RATE_LIMITING_AVAILABLE:
        AuditLogger.log_security_event(
            "rate_limit_exceeded",
            {
                "limit": str(exc.detail),
                "retry_after": getattr(exc, 'retry_after', 'unknown')
            },
            request
        )
        
        response = Response(
            content=json.dumps({
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please try again later.",
                "retry_after": getattr(exc, 'retry_after', 60)
            }),
            status_code=429,
            headers={"Content-Type": "application/json"}
        )
        return response
    else:
        # Return generic error if rate limiting not available
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={"error": "Rate limiting not available"}
        ) 