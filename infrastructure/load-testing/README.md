# FieldForce Load Testing Suite

Comprehensive load testing infrastructure for validating FieldForce's 2M+ daily submissions capacity.

## Tools Included

| Tool | Purpose | Best For |
|------|---------|----------|
| **k6** | Modern JavaScript load testing | CI/CD, complex scenarios |
| **Locust** | Python-based load testing | Easy customization, web UI |

---

## Quick Start

### k6 (Recommended)

```bash
# Install k6
brew install k6  # macOS
# or: https://k6.io/docs/getting-started/installation/

# Basic load test
cd /app/infrastructure/load-testing/k6
k6 run load-test.js

# With custom parameters
k6 run --vus 100 --duration 5m load-test.js

# With environment variables
BASE_URL=https://fieldforce.example.com \
TEST_EMAIL=test@example.com \
TEST_PASSWORD=secret \
k6 run load-test.js

# Stress test (find breaking point)
k6 run stress-test.js

# Soak test (4-hour endurance)
k6 run soak-test.js
```

### Locust

```bash
# Install Locust
pip install locust

# Run with web UI
cd /app/infrastructure/load-testing/locust
locust -f locustfile.py --host=http://localhost:8001
# Open http://localhost:8089

# Run headless
locust -f locustfile.py \
  --host=http://localhost:8001 \
  --headless \
  -u 500 \
  -r 50 \
  -t 10m

# Distributed mode
locust -f locustfile.py --master
locust -f locustfile.py --worker --master-host=<master-ip>
```

---

## Test Scenarios

### 1. Load Test (`load-test.js`)
Standard load test with mixed operations:
- 50-200 concurrent users
- Mix of submissions, reads, analytics
- 15-minute duration

**Target Metrics:**
- p95 latency < 500ms
- Error rate < 1%
- Throughput > 1000 req/s

### 2. Stress Test (`stress-test.js`)
Find the breaking point:
- Ramps from 0 to 500 users
- 45-minute duration
- Focus on submission endpoint

**Goals:**
- Identify maximum capacity
- Find bottlenecks
- Test auto-scaling triggers

### 3. Soak Test (`soak-test.js`)
Long-duration endurance test:
- 100 constant users
- 4-hour duration
- Watch for memory leaks

**Watch For:**
- Response time degradation
- Memory growth
- Connection pool exhaustion

---

## Capacity Validation

### 2M+ Daily Submissions Calculation

```
Target: 2,000,000 submissions/day

Per second: 2,000,000 / 86,400 = ~23 submissions/s (average)
Peak (3x average): ~70 submissions/s

With safety margin (5x):
Target throughput: 350 submissions/s
```

### Test Parameters for 2M+ Validation

```bash
# k6 - Sustained load test
k6 run --vus 200 --duration 1h load-test.js

# Expected metrics:
# - Submissions: 70-100/s
# - Total in 1h: 250,000-360,000
# - Extrapolated daily: 6-8M
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Test target
export BASE_URL=http://localhost:8001

# Authentication
export TEST_EMAIL=demo@fieldforce.io
export TEST_PASSWORD=Test123!

# Optional: Separate read/write users
export READER_EMAIL=reader@fieldforce.io
export WRITER_EMAIL=writer@fieldforce.io
```

### Test Data Setup

1. **Create test user:**
   ```bash
   curl -X POST $BASE_URL/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"loadtest@example.com","password":"LoadTest123!","name":"Load Test User"}'
   ```

2. **Create test form:**
   ```bash
   # Login first, then create a form via API or UI
   ```

---

## Results Interpretation

### k6 Output

```
✓ http_req_duration..............: avg=45ms    p(95)=120ms
✓ http_req_failed................: 0.15%
✓ fieldforce_submission_success..: 99.85%
✓ fieldforce_submissions.........: 125000
```

### Key Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| p95 Latency | < 200ms | 200-500ms | > 500ms |
| Error Rate | < 0.5% | 0.5-2% | > 2% |
| Throughput | > 100/s | 50-100/s | < 50/s |

### Grafana Dashboard

During load tests, monitor:
1. **API Response Time** - Watch for degradation
2. **Queue Depth** - Should stay below 5000
3. **MongoDB Operations/s** - Watch for saturation
4. **Worker CPU/Memory** - Check for resource exhaustion

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run Load Test
        run: |
          k6 run infrastructure/load-testing/k6/load-test.js \
            --out json=results.json
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: results.json
```

---

## Troubleshooting

### Common Issues

**1. Authentication failures**
```
Check TEST_EMAIL and TEST_PASSWORD environment variables
Ensure test user exists and has appropriate permissions
```

**2. High error rate**
```
- Check API logs: tail -f /var/log/supervisor/backend.err.log
- Verify database connections: db.serverStatus()
- Check Redis availability
```

**3. Slow response times**
```
- Monitor MongoDB: db.currentOp()
- Check worker queue depth
- Verify indexes exist
```

**4. Connection refused**
```
- Verify BASE_URL is correct
- Check if API is running: curl $BASE_URL/api/health
- Check firewall rules
```

---

## Files Reference

```
/app/infrastructure/load-testing/
├── k6/
│   ├── load-test.js      # Standard load test
│   ├── stress-test.js    # Breaking point test
│   └── soak-test.js      # Endurance test
├── locust/
│   └── locustfile.py     # Locust scenarios
└── README.md             # This file
```
