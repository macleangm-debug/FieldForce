# FieldForce Production Deployment Guide

## Overview

This guide covers deploying FieldForce in a production environment with high availability, scalability, and security.

## Architecture

```
                                    ┌─────────────────┐
                                    │   CloudFront    │
                                    │      CDN        │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
            ┌───────────────┐      ┌─────────────────┐      ┌─────────────────┐
            │    Frontend   │      │   Nginx Load    │      │      S3         │
            │  (React SPA)  │      │    Balancer     │      │   (Media)       │
            └───────────────┘      └────────┬────────┘      └─────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
            │  API Server 1 │      │  API Server 2 │      │  API Server 3 │
            │   (FastAPI)   │      │   (FastAPI)   │      │   (FastAPI)   │
            └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
                    │                      │                       │
                    └──────────────────────┼───────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
            │    MongoDB    │      │    Redis      │      │   Celery      │
            │  Replica Set  │      │    Cluster    │      │   Workers     │
            └───────────────┘      └───────────────┘      └───────────────┘
```

## Components

### 1. Load Balancer (Nginx)
- Distributes traffic across API servers
- Rate limiting by endpoint type
- SSL termination
- Health checks

### 2. API Servers (FastAPI)
- Stateless design for horizontal scaling
- Gunicorn with Uvicorn workers
- Connection pooling to databases
- Auto-restart on failure

### 3. MongoDB (Replica Set)
- Primary + 2 secondaries for HA
- Automatic failover
- Read scaling via secondaries
- Sharding for large datasets

### 4. Redis
- Session caching
- Rate limiting data
- Background job queue (Celery)
- Real-time metrics

### 5. S3 Storage
- Media file uploads
- Export file storage
- CloudFront CDN integration
- Lifecycle policies for cleanup

### 6. Celery Workers
- Background job processing
- Export generation
- Email notifications
- Scheduled tasks

## Deployment Steps

### Prerequisites
- Docker & Docker Compose
- AWS account (for S3)
- Domain name
- SSL certificate

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-org/fieldforce.git
cd fieldforce

# Copy environment template
cp .env.production.template .env

# Edit configuration
nano .env
```

### 2. Configure Environment Variables

```env
# Required
MONGO_URL=mongodb://mongo:27017
DB_NAME=fieldforce
REDIS_URL=redis://redis:6379/0
JWT_SECRET=<generate-secure-key>
PRODUCTION_MODE=true

# AWS S3
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET=fieldforce-uploads

# Optional
CDN_DOMAIN=cdn.yourdomain.com
CORS_ORIGINS=https://app.yourdomain.com
```

### 3. Deploy with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Scale API servers
docker-compose -f docker-compose.production.yml up -d --scale api=3

# View logs
docker-compose -f docker-compose.production.yml logs -f api

# Enable monitoring (optional)
docker-compose -f docker-compose.production.yml --profile monitoring up -d
```

### 4. Initialize MongoDB Replica Set

```bash
# Connect to primary
docker exec -it fieldforce_mongo_1 mongosh

# Initialize replica set
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo:27017", priority: 2 },
    { _id: 1, host: "mongo-secondary:27017", priority: 1 }
  ]
})
```

### 5. Configure SSL (Let's Encrypt)

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

## Scaling Guidelines

### Vertical Scaling
| Component | Minimum | Recommended | High Traffic |
|-----------|---------|-------------|--------------|
| API Server | 1 CPU, 1GB | 2 CPU, 2GB | 4 CPU, 4GB |
| MongoDB | 2 CPU, 4GB | 4 CPU, 8GB | 8 CPU, 16GB |
| Redis | 1 CPU, 512MB | 2 CPU, 1GB | 2 CPU, 2GB |
| Celery | 1 CPU, 512MB | 2 CPU, 1GB | 2 CPU, 2GB |

### Horizontal Scaling
| Load Level | API Servers | Celery Workers |
|------------|-------------|----------------|
| Light (<1K users) | 2 | 1 |
| Medium (1K-10K) | 3-5 | 2-3 |
| Heavy (10K-50K) | 5-10 | 3-5 |
| Enterprise (50K+) | 10+ | 5+ |

## Monitoring

### Health Endpoints
- `/api/health` - Basic health check (for load balancer)
- `/api/health/detailed` - Full system status
- `/api/metrics` - Prometheus metrics

### Grafana Dashboards
Access at `http://your-server:3001` (default password: admin)

Included dashboards:
- API Request Rates
- Response Times (p50, p95, p99)
- Error Rates
- Database Performance
- Cache Hit Rates
- Background Job Queue

### Alerts
Configure alerts for:
- API response time > 2s
- Error rate > 5%
- Database connection failures
- Redis memory > 80%
- Disk usage > 85%

## Backup Strategy

### MongoDB
```bash
# Daily backup
mongodump --uri="mongodb://mongo:27017" --out=/backups/$(date +%Y%m%d)

# Point-in-time recovery with oplog
mongodump --uri="mongodb://mongo:27017" --oplog --out=/backups/pitr
```

### Redis
```bash
# Trigger RDB snapshot
redis-cli BGSAVE

# Copy RDB file
cp /data/dump.rdb /backups/redis/$(date +%Y%m%d).rdb
```

### S3 Media Files
- Enable versioning on S3 bucket
- Configure cross-region replication
- Set lifecycle policies for old versions

## Security Checklist

- [ ] Change default JWT secret
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use Redis password
- [ ] Regular security updates
- [ ] Enable audit logging
- [ ] Implement IP whitelisting (admin endpoints)
- [ ] Set up intrusion detection

## Troubleshooting

### API Not Responding
```bash
# Check API logs
docker-compose logs api

# Restart API servers
docker-compose restart api

# Check nginx
docker-compose logs nginx
```

### Database Issues
```bash
# Check replica set status
docker exec fieldforce_mongo_1 mongosh --eval "rs.status()"

# Check connections
docker exec fieldforce_mongo_1 mongosh --eval "db.serverStatus().connections"
```

### High Memory Usage
```bash
# Check Redis memory
redis-cli INFO memory

# Clear cache if needed
redis-cli FLUSHDB
```

## Support

- Documentation: https://docs.fieldforce.io
- Issues: https://github.com/your-org/fieldforce/issues
- Email: support@fieldforce.io
