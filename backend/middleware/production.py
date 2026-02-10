"""
Production Middleware for FieldForce
Request tracking, rate limiting, and performance monitoring
"""
import time
import logging
from typing import Callable
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from config.production import RateLimiter, MetricsCollector

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware using Redis"""
    
    # Rate limits by path prefix (requests per minute)
    RATE_LIMITS = {
        "/api/auth/login": 10,        # Strict limit on login attempts
        "/api/auth/register": 5,      # Very strict on registration
        "/api/submissions": 200,      # Higher for data sync
        "/api/media": 100,            # Media uploads
        "/api/export": 20,            # Exports are expensive
        "/api": 100,                  # Default API limit
    }
    
    def __init__(self, app: ASGIApp, enabled: bool = True):
        super().__init__(app)
        self.enabled = enabled
    
    def get_rate_limit(self, path: str) -> int:
        """Get rate limit for path"""
        for prefix, limit in self.RATE_LIMITS.items():
            if path.startswith(prefix):
                return limit
        return 100  # Default
    
    def get_client_id(self, request: Request) -> str:
        """Get client identifier for rate limiting"""
        # Try to get user ID from auth header
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            # Hash the token for privacy
            import hashlib
            token_hash = hashlib.sha256(auth.encode()).hexdigest()[:16]
            return f"user:{token_hash}"
        
        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "unknown"
        return f"ip:{ip}"
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.enabled:
            return await call_next(request)
        
        # Skip rate limiting for health checks
        if request.url.path in ["/api/health", "/api/"]:
            return await call_next(request)
        
        client_id = self.get_client_id(request)
        rate_limit = self.get_rate_limit(request.url.path)
        
        allowed, info = await RateLimiter.is_allowed(
            f"{client_id}:{request.url.path}",
            limit=rate_limit,
            window=60
        )
        
        if not allowed:
            logger.warning(f"Rate limit exceeded: {client_id} on {request.url.path}")
            await MetricsCollector.increment("rate_limit_exceeded", tags={
                "path": request.url.path.split("/")[2] if len(request.url.path.split("/")) > 2 else "root"
            })
            return Response(
                content='{"detail": "Rate limit exceeded. Please try again later."}',
                status_code=429,
                headers={
                    "Content-Type": "application/json",
                    "X-RateLimit-Limit": str(info.get("limit", 0)),
                    "X-RateLimit-Remaining": str(info.get("remaining", 0)),
                    "X-RateLimit-Reset": str(info.get("reset", 0)),
                    "Retry-After": "60"
                }
            )
        
        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(info.get("limit", 0))
        response.headers["X-RateLimit-Remaining"] = str(info.get("remaining", 0))
        response.headers["X-RateLimit-Reset"] = str(info.get("reset", 0))
        
        return response


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Middleware to track request timing and metrics"""
    
    def __init__(self, app: ASGIApp, enabled: bool = True):
        super().__init__(app)
        self.enabled = enabled
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.enabled:
            return await call_next(request)
        
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Add timing header
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        
        # Track metrics
        path_group = self._get_path_group(request.url.path)
        
        await MetricsCollector.increment("requests_total", tags={
            "method": request.method,
            "path": path_group,
            "status": str(response.status_code)
        })
        
        await MetricsCollector.timing("request_duration", duration_ms, tags={
            "method": request.method,
            "path": path_group
        })
        
        # Log slow requests
        if duration_ms > 1000:
            logger.warning(f"Slow request: {request.method} {request.url.path} took {duration_ms:.2f}ms")
        
        return response
    
    def _get_path_group(self, path: str) -> str:
        """Group paths for metrics (avoid high cardinality)"""
        parts = path.split("/")
        if len(parts) >= 3:
            return f"/{parts[1]}/{parts[2]}"
        return path


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Only add HSTS in production
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests for debugging"""
    
    def __init__(self, app: ASGIApp, log_body: bool = False):
        super().__init__(app)
        self.log_body = log_body
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip logging for health checks
        if request.url.path in ["/api/health", "/api/"]:
            return await call_next(request)
        
        # Log request
        logger.info(f"→ {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
        
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Log response
        logger.info(f"← {request.method} {request.url.path} → {response.status_code} ({duration*1000:.0f}ms)")
        
        return response
