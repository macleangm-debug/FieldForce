/**
 * FieldForce Stress Test - k6
 * Extreme load testing to find breaking points
 * 
 * Usage:
 *   k6 run stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const submissionCounter = new Counter('stress_submissions');
const errorCounter = new Counter('stress_errors');
const successRate = new Rate('stress_success_rate');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8001';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'demo@fieldforce.io';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'Test123!';

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Warm up to 100 users
        { duration: '5m', target: 100 },   // Hold at 100
        { duration: '2m', target: 200 },   // Ramp to 200
        { duration: '5m', target: 200 },   // Hold at 200
        { duration: '2m', target: 300 },   // Ramp to 300
        { duration: '5m', target: 300 },   // Hold at 300
        { duration: '2m', target: 400 },   // Ramp to 400
        { duration: '5m', target: 400 },   // Hold at 400
        { duration: '2m', target: 500 },   // Ramp to 500 (target peak)
        { duration: '10m', target: 500 },  // Hold at peak
        { duration: '5m', target: 0 },     // Ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // More lenient for stress test
    http_req_failed: ['rate<0.10'],     // Allow up to 10% errors under stress
  },
};

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (loginRes.status !== 200) {
    console.error('Login failed');
    return null;
  }
  
  const formsRes = http.get(`${BASE_URL}/api/forms`, {
    headers: { 
      'Authorization': `Bearer ${loginRes.json('access_token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  return {
    token: loginRes.json('access_token'),
    formId: formsRes.status === 200 && formsRes.json().length > 0 ? formsRes.json()[0].id : null,
  };
}

export default function(data) {
  if (!data || !data.token) return;
  
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };
  
  // Focus on submissions for stress test
  if (data.formId) {
    const submission = {
      form_id: data.formId,
      form_version: 1,
      data: {
        name: `Stress ${randomString(8)}`,
        value: randomIntBetween(1, 1000),
        timestamp: new Date().toISOString(),
      },
      device_id: `stress_${randomString(8)}`,
    };
    
    const res = http.post(`${BASE_URL}/api/submissions`, JSON.stringify(submission), {
      headers: headers,
      timeout: '30s',
    });
    
    const success = res.status === 200 || res.status === 201;
    successRate.add(success);
    
    if (success) {
      submissionCounter.add(1);
    } else {
      errorCounter.add(1);
    }
  }
  
  sleep(0.5);  // Minimal think time for maximum stress
}

export function teardown(data) {
  console.log(`
================================================================================
                           STRESS TEST COMPLETE
================================================================================
Total Submissions Attempted: ${submissionCounter}
Errors: ${errorCounter}
================================================================================
`);
}
