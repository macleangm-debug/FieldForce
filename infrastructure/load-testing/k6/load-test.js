/**
 * FieldForce Load Testing Suite - k6
 * Tests for 2M+ daily submissions capacity
 * 
 * Usage:
 *   k6 run --vus 100 --duration 5m load-test.js
 *   k6 run --vus 500 --duration 30m --out json=results.json load-test.js
 * 
 * Environment Variables:
 *   BASE_URL - API base URL (default: http://localhost:8001)
 *   TEST_EMAIL - Test user email
 *   TEST_PASSWORD - Test user password
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const submissionCounter = new Counter('fieldforce_submissions');
const submissionErrors = new Counter('fieldforce_submission_errors');
const submissionRate = new Rate('fieldforce_submission_success_rate');
const submissionDuration = new Trend('fieldforce_submission_duration');
const bulkSubmissionSize = new Gauge('fieldforce_bulk_size');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8001';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'demo@fieldforce.io';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'Test123!';

// Test scenarios
export const options = {
  scenarios: {
    // Scenario 1: Constant load (baseline)
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      tags: { scenario: 'constant' },
    },
    
    // Scenario 2: Ramping load (stress test)
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },  // Ramp up
        { duration: '5m', target: 100 },  // Steady
        { duration: '2m', target: 200 },  // Stress
        { duration: '3m', target: 200 },  // Hold stress
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { scenario: 'ramping' },
    },
    
    // Scenario 3: Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // Warm up
        { duration: '30s', target: 500 },  // Spike!
        { duration: '1m', target: 500 },   // Hold spike
        { duration: '30s', target: 10 },   // Recovery
      ],
      tags: { scenario: 'spike' },
      startTime: '15m',  // Start after constant and ramping
    },
    
    // Scenario 4: Bulk submission load
    bulk_submissions: {
      executor: 'constant-arrival-rate',
      rate: 10,  // 10 bulk requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 100,
      tags: { scenario: 'bulk' },
      startTime: '20m',
    },
  },
  
  thresholds: {
    // Response time thresholds
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% < 500ms, 99% < 1s
    
    // Error rate threshold
    http_req_failed: ['rate<0.01'],  // Less than 1% errors
    
    // Custom metrics
    fieldforce_submission_success_rate: ['rate>0.99'],  // 99%+ success
    fieldforce_submission_duration: ['p(95)<1000'],     // 95% < 1s
  },
};

// Shared state
let authToken = null;
let testFormId = null;

// Setup function - runs once before tests
export function setup() {
  console.log(`Testing against: ${BASE_URL}`);
  
  // Login to get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has access token': (r) => r.json('access_token') !== undefined,
  });
  
  if (loginRes.status !== 200) {
    console.error('Login failed:', loginRes.body);
    return null;
  }
  
  const token = loginRes.json('access_token');
  
  // Get or create a test form
  const formsRes = http.get(`${BASE_URL}/api/forms`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  let formId = null;
  if (formsRes.status === 200 && formsRes.json().length > 0) {
    formId = formsRes.json()[0].id;
    console.log(`Using existing form: ${formId}`);
  }
  
  return {
    token: token,
    formId: formId,
  };
}

// Main test function
export default function(data) {
  if (!data || !data.token) {
    console.error('No auth token available');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };
  
  // Randomly choose test type based on scenario
  const scenario = __ENV.SCENARIO || 'mixed';
  
  group('API Tests', function() {
    // Test 1: Health check
    group('Health Check', function() {
      const res = http.get(`${BASE_URL}/api/health`);
      check(res, {
        'health check status 200': (r) => r.status === 200,
        'database connected': (r) => r.json('database') === 'connected',
      });
    });
    
    // Test 2: Single submission
    if (data.formId) {
      group('Single Submission', function() {
        const submission = generateSubmission(data.formId);
        const startTime = Date.now();
        
        const res = http.post(`${BASE_URL}/api/submissions`, JSON.stringify(submission), {
          headers: headers,
        });
        
        const duration = Date.now() - startTime;
        submissionDuration.add(duration);
        
        const success = res.status === 200 || res.status === 201;
        submissionRate.add(success);
        
        if (success) {
          submissionCounter.add(1);
        } else {
          submissionErrors.add(1);
        }
        
        check(res, {
          'submission created': (r) => r.status === 200 || r.status === 201,
          'has submission id': (r) => r.json('id') !== undefined,
        });
      });
    }
    
    // Test 3: Bulk submission (less frequent)
    if (data.formId && Math.random() < 0.1) {  // 10% of iterations
      group('Bulk Submission', function() {
        const batchSize = randomIntBetween(10, 100);
        const submissions = [];
        
        for (let i = 0; i < batchSize; i++) {
          submissions.push(generateSubmission(data.formId));
        }
        
        bulkSubmissionSize.add(batchSize);
        const startTime = Date.now();
        
        const res = http.post(`${BASE_URL}/api/submissions/bulk`, JSON.stringify({
          submissions: submissions,
          async_processing: true,
        }), {
          headers: headers,
          timeout: '60s',
        });
        
        const duration = Date.now() - startTime;
        
        check(res, {
          'bulk submission accepted': (r) => r.status === 200,
          'has success count': (r) => r.json('success_count') !== undefined,
        });
        
        if (res.status === 200) {
          submissionCounter.add(res.json('success_count') || 0);
          console.log(`Bulk: ${batchSize} submissions in ${duration}ms`);
        }
      });
    }
    
    // Test 4: List submissions (read load)
    group('List Submissions', function() {
      const res = http.get(`${BASE_URL}/api/submissions?limit=50`, {
        headers: headers,
      });
      
      check(res, {
        'list status 200': (r) => r.status === 200,
        'returns array': (r) => Array.isArray(r.json()),
      });
    });
    
    // Test 5: Analytics query
    if (Math.random() < 0.05) {  // 5% of iterations
      group('Analytics Query', function() {
        const res = http.get(`${BASE_URL}/api/analytics/submissions/summary`, {
          headers: headers,
        });
        
        check(res, {
          'analytics status 200': (r) => r.status === 200,
        });
      });
    }
  });
  
  // Random think time between iterations
  sleep(randomIntBetween(1, 3));
}

// Helper: Generate random submission data
function generateSubmission(formId) {
  return {
    form_id: formId,
    form_version: 1,
    data: {
      name: `Test User ${randomString(8)}`,
      email: `test_${randomString(6)}@example.com`,
      age: randomIntBetween(18, 65),
      rating: randomIntBetween(1, 5),
      feedback: `Automated test feedback ${randomString(20)}`,
      timestamp: new Date().toISOString(),
      _gps: {
        latitude: randomIntBetween(-90, 90) + Math.random(),
        longitude: randomIntBetween(-180, 180) + Math.random(),
        accuracy: randomIntBetween(5, 50),
      },
    },
    device_id: `device_${randomString(12)}`,
    device_info: {
      platform: 'k6-test',
      app_version: '1.0.0',
      os_version: 'test',
    },
  };
}

// Teardown function - runs once after all tests
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total submissions: ${submissionCounter}`);
}

// Handle summary
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    metrics: {
      http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'],
      http_req_duration_p99: data.metrics.http_req_duration?.values?.['p(99)'],
      http_req_failed_rate: data.metrics.http_req_failed?.values?.rate,
      total_requests: data.metrics.http_reqs?.values?.count,
      submissions_total: data.metrics.fieldforce_submissions?.values?.count,
      submission_success_rate: data.metrics.fieldforce_submission_success_rate?.values?.rate,
    },
    thresholds: data.thresholds,
  };
  
  return {
    'summary.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  return `
================================================================================
                         FIELDFORCE LOAD TEST RESULTS
================================================================================

Test Duration: ${data.state?.testRunDurationMs / 1000}s
Total Requests: ${data.metrics.http_reqs?.values?.count || 0}
Total Submissions: ${data.metrics.fieldforce_submissions?.values?.count || 0}

Response Times:
  - p50: ${(data.metrics.http_req_duration?.values?.['p(50)'] || 0).toFixed(2)}ms
  - p95: ${(data.metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms
  - p99: ${(data.metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms

Error Rate: ${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%
Submission Success Rate: ${((data.metrics.fieldforce_submission_success_rate?.values?.rate || 0) * 100).toFixed(2)}%

Requests/Second: ${(data.metrics.http_reqs?.values?.rate || 0).toFixed(2)}
Submissions/Second: ${(data.metrics.fieldforce_submissions?.values?.rate || 0).toFixed(2)}

================================================================================
`;
}
