"""
FieldForce Load Testing - Locust
Python-based load testing alternative to k6

Usage:
    locust -f locustfile.py --host=http://localhost:8001
    locust -f locustfile.py --host=http://localhost:8001 --headless -u 500 -r 50 -t 10m

Environment Variables:
    TEST_EMAIL - Test user email (default: demo@fieldforce.io)
    TEST_PASSWORD - Test user password (default: Test123!)
"""

import os
import random
import string
import json
from locust import HttpUser, task, between, events
from locust.runners import MasterRunner

# Configuration
TEST_EMAIL = os.getenv('TEST_EMAIL', 'demo@fieldforce.io')
TEST_PASSWORD = os.getenv('TEST_PASSWORD', 'Test123!')


def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


class FieldForceUser(HttpUser):
    """Simulates a FieldForce user performing various operations"""
    
    wait_time = between(1, 3)  # Think time between requests
    
    def on_start(self):
        """Login and setup on user start"""
        # Login
        response = self.client.post('/api/auth/login', json={
            'email': TEST_EMAIL,
            'password': TEST_PASSWORD,
        })
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('access_token')
            self.headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json',
            }
            
            # Get available forms
            forms_response = self.client.get('/api/forms', headers=self.headers)
            if forms_response.status_code == 200:
                forms = forms_response.json()
                self.form_id = forms[0]['id'] if forms else None
            else:
                self.form_id = None
        else:
            self.token = None
            self.headers = {}
            self.form_id = None
    
    @task(10)
    def submit_data(self):
        """Submit a single form entry (most common operation)"""
        if not self.form_id:
            return
        
        submission = {
            'form_id': self.form_id,
            'form_version': 1,
            'data': {
                'name': f'Test User {random_string()}',
                'email': f'test_{random_string(6)}@example.com',
                'age': random.randint(18, 65),
                'rating': random.randint(1, 5),
                'feedback': f'Locust test feedback {random_string(20)}',
                '_gps': {
                    'latitude': random.uniform(-90, 90),
                    'longitude': random.uniform(-180, 180),
                    'accuracy': random.randint(5, 50),
                },
            },
            'device_id': f'locust_{random_string(12)}',
            'device_info': {
                'platform': 'locust-test',
                'app_version': '1.0.0',
            },
        }
        
        self.client.post('/api/submissions', json=submission, headers=self.headers)
    
    @task(2)
    def bulk_submit(self):
        """Submit bulk form entries (offline sync simulation)"""
        if not self.form_id:
            return
        
        batch_size = random.randint(10, 50)
        submissions = []
        
        for _ in range(batch_size):
            submissions.append({
                'form_id': self.form_id,
                'form_version': 1,
                'data': {
                    'name': f'Bulk User {random_string()}',
                    'value': random.randint(1, 1000),
                },
                'device_id': f'locust_bulk_{random_string(8)}',
            })
        
        self.client.post('/api/submissions/bulk', json={
            'submissions': submissions,
            'async_processing': True,
        }, headers=self.headers, timeout=60)
    
    @task(5)
    def list_submissions(self):
        """List recent submissions (read operation)"""
        self.client.get(
            f'/api/submissions?limit=50&offset={random.randint(0, 100)}',
            headers=self.headers
        )
    
    @task(1)
    def get_analytics(self):
        """Query analytics dashboard"""
        self.client.get('/api/analytics/submissions/summary', headers=self.headers)
    
    @task(3)
    def health_check(self):
        """Health check endpoint"""
        self.client.get('/api/health')
    
    @task(1)
    def list_forms(self):
        """List available forms"""
        self.client.get('/api/forms', headers=self.headers)
    
    @task(1)
    def list_projects(self):
        """List projects"""
        self.client.get('/api/projects', headers=self.headers)


class HighVolumeUser(HttpUser):
    """High-volume submission user for stress testing"""
    
    wait_time = between(0.1, 0.5)  # Very short wait time
    
    def on_start(self):
        response = self.client.post('/api/auth/login', json={
            'email': TEST_EMAIL,
            'password': TEST_PASSWORD,
        })
        
        if response.status_code == 200:
            self.token = response.json().get('access_token')
            self.headers = {'Authorization': f'Bearer {self.token}'}
            
            forms_response = self.client.get('/api/forms', headers=self.headers)
            self.form_id = forms_response.json()[0]['id'] if forms_response.status_code == 200 and forms_response.json() else None
        else:
            self.token = None
            self.form_id = None
    
    @task
    def rapid_submit(self):
        """Rapid submission for high throughput testing"""
        if not self.form_id:
            return
        
        self.client.post('/api/submissions', json={
            'form_id': self.form_id,
            'form_version': 1,
            'data': {'value': random.randint(1, 1000)},
            'device_id': f'rapid_{random_string(8)}',
        }, headers=self.headers)


class BulkSyncUser(HttpUser):
    """Simulates bulk offline sync scenarios"""
    
    wait_time = between(5, 10)  # Longer wait, but big batches
    
    def on_start(self):
        response = self.client.post('/api/auth/login', json={
            'email': TEST_EMAIL,
            'password': TEST_PASSWORD,
        })
        
        if response.status_code == 200:
            self.token = response.json().get('access_token')
            self.headers = {'Authorization': f'Bearer {self.token}'}
            
            forms_response = self.client.get('/api/forms', headers=self.headers)
            self.form_id = forms_response.json()[0]['id'] if forms_response.status_code == 200 and forms_response.json() else None
        else:
            self.token = None
            self.form_id = None
    
    @task
    def large_bulk_sync(self):
        """Large batch sync (100-500 submissions)"""
        if not self.form_id:
            return
        
        batch_size = random.randint(100, 500)
        submissions = [{
            'form_id': self.form_id,
            'form_version': 1,
            'data': {
                'name': f'Sync {random_string()}',
                'value': random.randint(1, 1000),
            },
            'device_id': f'sync_{random_string(8)}',
        } for _ in range(batch_size)]
        
        with self.client.post('/api/submissions/bulk', json={
            'submissions': submissions,
            'async_processing': True,
        }, headers=self.headers, timeout=120, catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                success_count = data.get('success_count', 0)
                response.success()
                print(f"Bulk sync: {success_count}/{batch_size} successful")
            else:
                response.failure(f"Bulk sync failed: {response.status_code}")


# Custom event handlers for reporting
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("=" * 60)
    print("         FIELDFORCE LOAD TEST STARTING")
    print("=" * 60)
    print(f"Target host: {environment.host}")
    print(f"Test user: {TEST_EMAIL}")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("=" * 60)
    print("         FIELDFORCE LOAD TEST COMPLETE")
    print("=" * 60)
    
    if environment.stats.total.num_requests > 0:
        print(f"Total Requests: {environment.stats.total.num_requests}")
        print(f"Failed Requests: {environment.stats.total.num_failures}")
        print(f"Avg Response Time: {environment.stats.total.avg_response_time:.2f}ms")
        print(f"Requests/s: {environment.stats.total.current_rps:.2f}")


# Optional: Custom shape for staged load testing
class StagesShape:
    """Custom load shape for staged testing"""
    
    stages = [
        {"duration": 60, "users": 50, "spawn_rate": 10},   # Warm up
        {"duration": 300, "users": 100, "spawn_rate": 10}, # Normal load
        {"duration": 300, "users": 200, "spawn_rate": 20}, # High load
        {"duration": 300, "users": 300, "spawn_rate": 30}, # Stress
        {"duration": 120, "users": 0, "spawn_rate": 50},   # Ramp down
    ]
    
    def tick(self):
        run_time = self.get_run_time()
        
        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
            run_time -= stage["duration"]
        
        return None
