"""
Production Configuration for FieldForce
Handles Redis caching, S3 storage, rate limiting, and background jobs
"""
import os
from typing import Optional
from functools import wraps
import json
import hashlib
import asyncio
import logging
from datetime import datetime, timedelta

import redis.asyncio as aioredis
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================

class RedisConfig:
    """Redis connection manager for caching and rate limiting"""
    
    _instance: Optional[aioredis.Redis] = None
    
    @classmethod
    async def get_client(cls) -> Optional[aioredis.Redis]:
        """Get or create Redis client"""
        if cls._instance is None:
            redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379')
            try:
                cls._instance = aioredis.from_url(
                    redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    max_connections=50
                )
                # Test connection
                await cls._instance.ping()
                logger.info(f"Redis connected: {redis_url}")
            except Exception as e:
                logger.warning(f"Redis not available: {e}. Caching disabled.")
                cls._instance = None
        return cls._instance
    
    @classmethod
    async def close(cls):
        """Close Redis connection"""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None


class CacheManager:
    """Async cache manager with Redis backend"""
    
    DEFAULT_TTL = 300  # 5 minutes
    
    @staticmethod
    def _make_key(prefix: str, *args, **kwargs) -> str:
        """Generate cache key from prefix and arguments"""
        key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
        key_hash = hashlib.md5(key_data.encode()).hexdigest()[:12]
        return f"fieldforce:{prefix}:{key_hash}"
    
    @classmethod
    async def get(cls, key: str) -> Optional[str]:
        """Get value from cache"""
        redis = await RedisConfig.get_client()
        if redis:
            try:
                return await redis.get(key)
            except Exception as e:
                logger.warning(f"Cache get error: {e}")
        return None
    
    @classmethod
    async def set(cls, key: str, value: str, ttl: int = DEFAULT_TTL) -> bool:
        """Set value in cache with TTL"""
        redis = await RedisConfig.get_client()
        if redis:
            try:
                await redis.setex(key, ttl, value)
                return True
            except Exception as e:
                logger.warning(f"Cache set error: {e}")
        return False
    
    @classmethod
    async def delete(cls, key: str) -> bool:
        """Delete key from cache"""
        redis = await RedisConfig.get_client()
        if redis:
            try:
                await redis.delete(key)
                return True
            except Exception as e:
                logger.warning(f"Cache delete error: {e}")
        return False
    
    @classmethod
    async def delete_pattern(cls, pattern: str) -> int:
        """Delete all keys matching pattern"""
        redis = await RedisConfig.get_client()
        if redis:
            try:
                keys = await redis.keys(f"fieldforce:{pattern}:*")
                if keys:
                    return await redis.delete(*keys)
            except Exception as e:
                logger.warning(f"Cache delete pattern error: {e}")
        return 0
    
    @classmethod
    async def get_json(cls, key: str) -> Optional[dict]:
        """Get JSON value from cache"""
        data = await cls.get(key)
        if data:
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                pass
        return None
    
    @classmethod
    async def set_json(cls, key: str, value: dict, ttl: int = DEFAULT_TTL) -> bool:
        """Set JSON value in cache"""
        try:
            return await cls.set(key, json.dumps(value, default=str), ttl)
        except (TypeError, ValueError):
            return False


def cached(prefix: str, ttl: int = 300):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Skip 'self' or 'request' from cache key
            cache_args = args[1:] if args else args
            key = CacheManager._make_key(prefix, *cache_args, **kwargs)
            
            # Try to get from cache
            cached_result = await CacheManager.get_json(key)
            if cached_result is not None:
                logger.debug(f"Cache HIT: {key}")
                return cached_result
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            if result is not None:
                await CacheManager.set_json(key, result, ttl)
                logger.debug(f"Cache SET: {key}")
            
            return result
        return wrapper
    return decorator


def invalidate_cache(prefix: str):
    """Decorator to invalidate cache after function execution"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            await CacheManager.delete_pattern(prefix)
            logger.debug(f"Cache INVALIDATED: {prefix}")
            return result
        return wrapper
    return decorator


# =============================================================================
# S3 STORAGE CONFIGURATION
# =============================================================================

class S3Storage:
    """AWS S3 storage manager for file uploads"""
    
    _client = None
    _bucket = None
    
    @classmethod
    def get_client(cls):
        """Get or create S3 client"""
        if cls._client is None:
            aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
            aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
            aws_region = os.environ.get('AWS_REGION', 'us-east-1')
            cls._bucket = os.environ.get('S3_BUCKET', 'fieldforce-uploads')
            
            if aws_access_key and aws_secret_key:
                cls._client = boto3.client(
                    's3',
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key,
                    region_name=aws_region
                )
                logger.info(f"S3 client initialized for bucket: {cls._bucket}")
            else:
                logger.warning("AWS credentials not found. S3 storage disabled.")
        return cls._client
    
    @classmethod
    def is_available(cls) -> bool:
        """Check if S3 is available"""
        return cls.get_client() is not None
    
    @classmethod
    async def upload_file(
        cls, 
        file_content: bytes, 
        key: str, 
        content_type: str = 'application/octet-stream',
        metadata: dict = None
    ) -> Optional[str]:
        """Upload file to S3 and return URL"""
        client = cls.get_client()
        if not client:
            return None
        
        try:
            extra_args = {'ContentType': content_type}
            if metadata:
                extra_args['Metadata'] = {k: str(v) for k, v in metadata.items()}
            
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: client.put_object(
                    Bucket=cls._bucket,
                    Key=key,
                    Body=file_content,
                    **extra_args
                )
            )
            
            # Return CloudFront URL if configured, else S3 URL
            cdn_domain = os.environ.get('CDN_DOMAIN')
            if cdn_domain:
                return f"https://{cdn_domain}/{key}"
            return f"https://{cls._bucket}.s3.amazonaws.com/{key}"
            
        except ClientError as e:
            logger.error(f"S3 upload error: {e}")
            return None
    
    @classmethod
    async def get_presigned_url(
        cls, 
        key: str, 
        expiration: int = 3600,
        operation: str = 'get_object'
    ) -> Optional[str]:
        """Generate presigned URL for secure access"""
        client = cls.get_client()
        if not client:
            return None
        
        try:
            loop = asyncio.get_event_loop()
            url = await loop.run_in_executor(
                None,
                lambda: client.generate_presigned_url(
                    operation,
                    Params={'Bucket': cls._bucket, 'Key': key},
                    ExpiresIn=expiration
                )
            )
            return url
        except ClientError as e:
            logger.error(f"S3 presigned URL error: {e}")
            return None
    
    @classmethod
    async def delete_file(cls, key: str) -> bool:
        """Delete file from S3"""
        client = cls.get_client()
        if not client:
            return False
        
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: client.delete_object(Bucket=cls._bucket, Key=key)
            )
            return True
        except ClientError as e:
            logger.error(f"S3 delete error: {e}")
            return False
    
    @classmethod
    def generate_key(cls, org_id: str, category: str, filename: str) -> str:
        """Generate organized S3 key"""
        timestamp = datetime.utcnow().strftime('%Y/%m/%d')
        return f"{org_id}/{category}/{timestamp}/{filename}"


# =============================================================================
# RATE LIMITING
# =============================================================================

class RateLimiter:
    """Redis-based rate limiter"""
    
    @classmethod
    async def is_allowed(
        cls, 
        identifier: str, 
        limit: int = 100, 
        window: int = 60
    ) -> tuple[bool, dict]:
        """
        Check if request is allowed based on rate limit.
        Returns (allowed, info) where info contains remaining requests and reset time.
        """
        redis = await RedisConfig.get_client()
        if not redis:
            return True, {"remaining": -1, "reset": 0}
        
        key = f"ratelimit:{identifier}"
        
        try:
            pipe = redis.pipeline()
            now = datetime.utcnow().timestamp()
            window_start = now - window
            
            # Remove old entries
            await pipe.zremrangebyscore(key, 0, window_start)
            # Add current request
            await pipe.zadd(key, {str(now): now})
            # Count requests in window
            await pipe.zcard(key)
            # Set expiry
            await pipe.expire(key, window)
            
            results = await pipe.execute()
            current_count = results[2]
            
            remaining = max(0, limit - current_count)
            reset_time = int(now + window)
            
            return current_count <= limit, {
                "remaining": remaining,
                "reset": reset_time,
                "limit": limit
            }
            
        except Exception as e:
            logger.warning(f"Rate limit check error: {e}")
            return True, {"remaining": -1, "reset": 0}


# =============================================================================
# SESSION MANAGEMENT
# =============================================================================

class SessionManager:
    """Redis-based session management"""
    
    SESSION_TTL = 86400  # 24 hours
    
    @classmethod
    async def create_session(cls, user_id: str, data: dict) -> str:
        """Create new session and return session ID"""
        import uuid
        session_id = str(uuid.uuid4())
        key = f"session:{session_id}"
        
        session_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            **data
        }
        
        await CacheManager.set_json(key, session_data, cls.SESSION_TTL)
        
        # Also track user's sessions
        user_sessions_key = f"user_sessions:{user_id}"
        redis = await RedisConfig.get_client()
        if redis:
            await redis.sadd(user_sessions_key, session_id)
            await redis.expire(user_sessions_key, cls.SESSION_TTL)
        
        return session_id
    
    @classmethod
    async def get_session(cls, session_id: str) -> Optional[dict]:
        """Get session data"""
        key = f"session:{session_id}"
        return await CacheManager.get_json(key)
    
    @classmethod
    async def update_session(cls, session_id: str, data: dict) -> bool:
        """Update session data"""
        key = f"session:{session_id}"
        existing = await cls.get_session(session_id)
        if existing:
            existing.update(data)
            return await CacheManager.set_json(key, existing, cls.SESSION_TTL)
        return False
    
    @classmethod
    async def destroy_session(cls, session_id: str) -> bool:
        """Destroy session"""
        session = await cls.get_session(session_id)
        if session:
            user_id = session.get("user_id")
            if user_id:
                redis = await RedisConfig.get_client()
                if redis:
                    await redis.srem(f"user_sessions:{user_id}", session_id)
        
        return await CacheManager.delete(f"session:{session_id}")
    
    @classmethod
    async def destroy_user_sessions(cls, user_id: str) -> int:
        """Destroy all sessions for a user"""
        redis = await RedisConfig.get_client()
        if not redis:
            return 0
        
        sessions_key = f"user_sessions:{user_id}"
        session_ids = await redis.smembers(sessions_key)
        
        count = 0
        for session_id in session_ids:
            if await CacheManager.delete(f"session:{session_id}"):
                count += 1
        
        await redis.delete(sessions_key)
        return count


# =============================================================================
# HEALTH CHECK UTILITIES
# =============================================================================

class HealthChecker:
    """System health checker for load balancer"""
    
    @classmethod
    async def check_all(cls) -> dict:
        """Run all health checks"""
        checks = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {}
        }
        
        # Redis check
        redis = await RedisConfig.get_client()
        if redis:
            try:
                await redis.ping()
                checks["checks"]["redis"] = {"status": "healthy"}
            except Exception as e:
                checks["checks"]["redis"] = {"status": "unhealthy", "error": str(e)}
                checks["status"] = "degraded"
        else:
            checks["checks"]["redis"] = {"status": "unavailable"}
        
        # S3 check
        if S3Storage.is_available():
            checks["checks"]["s3"] = {"status": "healthy"}
        else:
            checks["checks"]["s3"] = {"status": "unavailable"}
        
        return checks


# =============================================================================
# METRICS COLLECTOR
# =============================================================================

class MetricsCollector:
    """Simple metrics collector using Redis"""
    
    @classmethod
    async def increment(cls, metric: str, value: int = 1, tags: dict = None):
        """Increment a counter metric"""
        redis = await RedisConfig.get_client()
        if not redis:
            return
        
        key = f"metrics:{metric}"
        if tags:
            tag_str = ":".join(f"{k}={v}" for k, v in sorted(tags.items()))
            key = f"{key}:{tag_str}"
        
        try:
            await redis.incrby(key, value)
            # Set expiry to 24 hours for auto-cleanup
            await redis.expire(key, 86400)
        except Exception as e:
            logger.warning(f"Metrics increment error: {e}")
    
    @classmethod
    async def gauge(cls, metric: str, value: float, tags: dict = None):
        """Set a gauge metric"""
        redis = await RedisConfig.get_client()
        if not redis:
            return
        
        key = f"metrics:{metric}"
        if tags:
            tag_str = ":".join(f"{k}={v}" for k, v in sorted(tags.items()))
            key = f"{key}:{tag_str}"
        
        try:
            await redis.set(key, value)
            await redis.expire(key, 86400)
        except Exception as e:
            logger.warning(f"Metrics gauge error: {e}")
    
    @classmethod
    async def timing(cls, metric: str, duration_ms: float, tags: dict = None):
        """Record a timing metric"""
        redis = await RedisConfig.get_client()
        if not redis:
            return
        
        key = f"metrics:timing:{metric}"
        if tags:
            tag_str = ":".join(f"{k}={v}" for k, v in sorted(tags.items()))
            key = f"{key}:{tag_str}"
        
        try:
            # Store in sorted set for percentile calculations
            timestamp = datetime.utcnow().timestamp()
            await redis.zadd(key, {f"{timestamp}:{duration_ms}": timestamp})
            # Keep only last hour of data
            await redis.zremrangebyscore(key, 0, timestamp - 3600)
            await redis.expire(key, 3600)
        except Exception as e:
            logger.warning(f"Metrics timing error: {e}")
