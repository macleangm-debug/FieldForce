/**
 * FieldForce Soak Test - k6
 * Extended duration test for memory leaks and degradation
 * 
 * Usage:
 *   k6 run --duration 4h soak-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const submissionCounter = new Counter('soak_submissions');
const responseTime = new Trend('soak_response_time');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8001';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'demo@fieldforce.io';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'Test123!';

export const options = {
  scenarios: {
    soak_test: {
      executor: 'constant-vus',
      vus: 100,  // Moderate, sustained load
      duration: '4h',  // 4-hour soak
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const formsRes = http.get(`${BASE_URL}/api/forms`, {
    headers: { 
      'Authorization': `Bearer ${loginRes.json('access_token')}`,
    },
  });
  
  return {
    token: loginRes.json('access_token'),
    formId: formsRes.json()[0]?.id,
  };
}

export default function(data) {
  if (!data?.token || !data?.formId) return;
  
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };
  
  // Mix of operations for realistic soak test
  const operation = Math.random();
  
  if (operation < 0.6) {
    // 60% submissions
    const submission = {
      form_id: data.formId,
      form_version: 1,
      data: {
        name: `Soak ${randomString(8)}`,
        value: randomIntBetween(1, 1000),
      },
      device_id: `soak_${randomString(8)}`,
    };
    
    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/submissions`, JSON.stringify(submission), {
      headers: headers,
    });
    responseTime.add(Date.now() - start);
    
    if (res.status === 200 || res.status === 201) {
      submissionCounter.add(1);
    }
    
  } else if (operation < 0.85) {
    // 25% reads
    http.get(`${BASE_URL}/api/submissions?limit=20`, { headers: headers });
    
  } else if (operation < 0.95) {
    // 10% analytics
    http.get(`${BASE_URL}/api/analytics/submissions/summary`, { headers: headers });
    
  } else {
    // 5% health checks
    http.get(`${BASE_URL}/api/health`);
  }
  
  // Realistic think time
  sleep(randomIntBetween(2, 5));
}

// Periodic health check during soak test
export function handleSummary(data) {
  const duration = data.state.testRunDurationMs / 1000 / 60;  // minutes
  const submissions = data.metrics.soak_submissions?.values?.count || 0;
  const rate = submissions / duration;
  
  return {
    stdout: `
================================================================================
                            SOAK TEST COMPLETE
================================================================================
Duration: ${duration.toFixed(0)} minutes
Total Submissions: ${submissions}
Average Rate: ${rate.toFixed(2)} submissions/minute

Response Time Trends:
  - Start p95: ${data.metrics.soak_response_time?.values?.['p(95)']?.toFixed(2)}ms
  - Final p95: Check Grafana for degradation over time

Memory/Resource Check: Review Grafana dashboards for any upward trends
================================================================================
`,
  };
}
