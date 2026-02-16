#!/bin/bash
# FieldForce Baseline Load Test Script
# Runs a quick load test to establish baseline metrics

set -e

echo "=============================================="
echo "  FieldForce Baseline Load Test"
echo "=============================================="

# Configuration
BASE_URL="${BASE_URL:-http://localhost:8001}"
TEST_EMAIL="${TEST_EMAIL:-demo@fieldforce.io}"
TEST_PASSWORD="${TEST_PASSWORD:-Test123!}"
DURATION="${DURATION:-60}"  # 60 seconds default
CONCURRENT="${CONCURRENT:-10}"  # 10 concurrent users

echo ""
echo "Configuration:"
echo "  Base URL: $BASE_URL"
echo "  Test User: $TEST_EMAIL"
echo "  Duration: ${DURATION}s"
echo "  Concurrent Users: $CONCURRENT"
echo ""

# Check if API is reachable
echo "🔍 Checking API health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null || echo "000")

if [ "$HEALTH_RESPONSE" != "200" ]; then
    echo "❌ API not reachable at $BASE_URL (status: $HEALTH_RESPONSE)"
    echo "   Please ensure the API is running."
    exit 1
fi
echo "✅ API is healthy"

# Login to get token
echo ""
echo "🔐 Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Authentication failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi
echo "✅ Authenticated successfully"

# Get a form ID for testing
echo ""
echo "📋 Getting test form..."
FORMS_RESPONSE=$(curl -s "$BASE_URL/api/forms" \
    -H "Authorization: Bearer $TOKEN")

FORM_ID=$(echo "$FORMS_RESPONSE" | python3 -c "import sys,json; forms=json.load(sys.stdin); print(forms[0]['id'] if forms else '')" 2>/dev/null)

if [ -z "$FORM_ID" ]; then
    echo "⚠️  No forms found. Creating test submissions without form validation."
    FORM_ID="test-form-id"
fi
echo "✅ Using form: $FORM_ID"

# Create results directory
RESULTS_DIR="/app/infrastructure/load-testing/results"
mkdir -p "$RESULTS_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$RESULTS_DIR/baseline_$TIMESTAMP.json"

# Run baseline test
echo ""
echo "=============================================="
echo "  Running Baseline Test"
echo "=============================================="
echo ""

# Initialize counters
TOTAL_REQUESTS=0
SUCCESSFUL_REQUESTS=0
FAILED_REQUESTS=0
TOTAL_TIME=0
START_TIME=$(date +%s)

# Function to make a submission
make_submission() {
    local start=$(date +%s%N)
    local response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" \
        -X POST "$BASE_URL/api/submissions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"form_id\": \"$FORM_ID\",
            \"form_version\": 1,
            \"data\": {
                \"name\": \"Baseline Test $RANDOM\",
                \"value\": $RANDOM,
                \"timestamp\": \"$(date -Iseconds)\"
            },
            \"device_id\": \"baseline_test_$RANDOM\"
        }" 2>/dev/null)
    
    local status=$(echo "$response" | cut -d: -f1)
    local time=$(echo "$response" | cut -d: -f2)
    
    echo "$status:$time"
}

# Progress bar function
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "\r["
    printf "%${filled}s" | tr ' ' '='
    printf "%${empty}s" | tr ' ' ' '
    printf "] %d%% (%d/%d)" "$percent" "$current" "$total"
}

# Run test loop
echo "Starting $DURATION second test with $CONCURRENT concurrent requests..."
echo ""

declare -a LATENCIES=()
declare -a STATUS_CODES=()

END_TIME=$((START_TIME + DURATION))
REQUEST_COUNT=0

while [ $(date +%s) -lt $END_TIME ]; do
    # Make concurrent requests
    for i in $(seq 1 $CONCURRENT); do
        result=$(make_submission)
        status=$(echo "$result" | cut -d: -f1)
        latency=$(echo "$result" | cut -d: -f2)
        
        REQUEST_COUNT=$((REQUEST_COUNT + 1))
        LATENCIES+=("$latency")
        STATUS_CODES+=("$status")
        
        if [ "$status" == "200" ] || [ "$status" == "201" ]; then
            SUCCESSFUL_REQUESTS=$((SUCCESSFUL_REQUESTS + 1))
        else
            FAILED_REQUESTS=$((FAILED_REQUESTS + 1))
        fi
    done
    
    # Show progress
    ELAPSED=$(($(date +%s) - START_TIME))
    show_progress $ELAPSED $DURATION
done

echo ""
echo ""

# Calculate statistics
ACTUAL_DURATION=$(($(date +%s) - START_TIME))
RPS=$(echo "scale=2; $REQUEST_COUNT / $ACTUAL_DURATION" | bc)
ERROR_RATE=$(echo "scale=2; $FAILED_REQUESTS * 100 / $REQUEST_COUNT" | bc)
SUCCESS_RATE=$(echo "scale=2; 100 - $ERROR_RATE" | bc)

# Calculate latency percentiles
SORTED_LATENCIES=($(printf '%s\n' "${LATENCIES[@]}" | sort -n))
COUNT=${#SORTED_LATENCIES[@]}

if [ $COUNT -gt 0 ]; then
    P50_IDX=$((COUNT * 50 / 100))
    P95_IDX=$((COUNT * 95 / 100))
    P99_IDX=$((COUNT * 99 / 100))
    
    P50=${SORTED_LATENCIES[$P50_IDX]}
    P95=${SORTED_LATENCIES[$P95_IDX]}
    P99=${SORTED_LATENCIES[$P99_IDX]}
    
    # Calculate average
    SUM=0
    for lat in "${LATENCIES[@]}"; do
        SUM=$(echo "$SUM + $lat" | bc)
    done
    AVG=$(echo "scale=3; $SUM / $COUNT" | bc)
else
    P50="N/A"
    P95="N/A"
    P99="N/A"
    AVG="N/A"
fi

# Print results
echo "=============================================="
echo "  Baseline Test Results"
echo "=============================================="
echo ""
echo "Duration:          ${ACTUAL_DURATION}s"
echo "Total Requests:    $REQUEST_COUNT"
echo "Successful:        $SUCCESSFUL_REQUESTS"
echo "Failed:            $FAILED_REQUESTS"
echo ""
echo "Throughput:        ${RPS} req/s"
echo "Success Rate:      ${SUCCESS_RATE}%"
echo "Error Rate:        ${ERROR_RATE}%"
echo ""
echo "Response Times:"
echo "  Average:         ${AVG}s"
echo "  p50:             ${P50}s"
echo "  p95:             ${P95}s"
echo "  p99:             ${P99}s"
echo ""

# Save results to JSON
cat > "$RESULTS_FILE" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "config": {
        "base_url": "$BASE_URL",
        "duration_seconds": $ACTUAL_DURATION,
        "concurrent_users": $CONCURRENT
    },
    "results": {
        "total_requests": $REQUEST_COUNT,
        "successful_requests": $SUCCESSFUL_REQUESTS,
        "failed_requests": $FAILED_REQUESTS,
        "requests_per_second": $RPS,
        "success_rate_percent": $SUCCESS_RATE,
        "error_rate_percent": $ERROR_RATE
    },
    "latency": {
        "avg_seconds": "$AVG",
        "p50_seconds": "$P50",
        "p95_seconds": "$P95",
        "p99_seconds": "$P99"
    }
}
EOF

echo "Results saved to: $RESULTS_FILE"
echo ""

# Assessment
echo "=============================================="
echo "  Assessment"
echo "=============================================="
echo ""

# Check against thresholds
PASS=true

if (( $(echo "$RPS < 10" | bc -l) )); then
    echo "⚠️  Low throughput: ${RPS} req/s (target: >10 req/s)"
    PASS=false
else
    echo "✅ Throughput OK: ${RPS} req/s"
fi

if (( $(echo "$ERROR_RATE > 1" | bc -l) )); then
    echo "⚠️  High error rate: ${ERROR_RATE}% (target: <1%)"
    PASS=false
else
    echo "✅ Error rate OK: ${ERROR_RATE}%"
fi

if [ "$P95" != "N/A" ]; then
    if (( $(echo "$P95 > 0.5" | bc -l) )); then
        echo "⚠️  High p95 latency: ${P95}s (target: <0.5s)"
        PASS=false
    else
        echo "✅ p95 latency OK: ${P95}s"
    fi
fi

echo ""
if [ "$PASS" = true ]; then
    echo "🎉 Baseline test PASSED!"
else
    echo "⚠️  Baseline test has warnings. Review results above."
fi

echo ""
echo "=============================================="
