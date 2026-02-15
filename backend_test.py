#!/usr/bin/env python3
"""
Backend API testing for Help Center with AI Assistant
Tests all help assistant endpoints and validates functionality
"""

import requests
import sys
import json
from datetime import datetime

class HelpCenterAPITester:
    def __init__(self, base_url="https://workforce-pull.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            
            self.log(f"   Response: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"   ✅ PASSED")
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, {}
            else:
                self.log(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_text = response.text
                    self.log(f"   Error: {error_text[:200]}")
                except:
                    pass
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"   ❌ FAILED - Request timeout")
            return False, {}
        except Exception as e:
            self.log(f"   ❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_login(self):
        """Test user authentication"""
        success, response = self.run_test(
            "User Authentication",
            "POST",
            "auth/login",
            200,
            data={"email": "demo@fieldforce.io", "password": "Test123!"}
        )
        
        if success:
            self.log(f"   📝 Auth Response: {response}")
            # Try different token field names
            token_keys = ['token', 'access_token', 'jwt', 'access']
            for key in token_keys:
                if key in response:
                    self.token = response[key]
                    self.log(f"   📝 Token obtained from '{key}': {str(self.token)[:20]}...")
                    return True
            
            # If no token found, still continue tests for public endpoints
            self.log(f"   ⚠️  No token found in response, will test public endpoints")
            return True
        return False

    def test_help_assistant_chat(self):
        """Test AI chat functionality"""
        success, response = self.run_test(
            "AI Assistant Chat",
            "POST", 
            "help-assistant/chat",
            200,
            data={"message": "How do I create a new form?"}
        )
        
        if success:
            self.session_id = response.get('session_id')
            response_text = response.get('response', '')
            self.log(f"   💬 AI Response: {response_text[:100]}...")
            self.log(f"   🔑 Session ID: {self.session_id}")
            
            # Check if response contains expected content
            if len(response_text) > 20 and self.session_id:
                return True
                
        return False

    def test_help_assistant_feedback(self):
        """Test feedback submission"""
        if not self.session_id:
            self.log("   ⚠️  No session ID from chat test, skipping feedback test")
            return False
            
        success, response = self.run_test(
            "AI Assistant Feedback",
            "POST",
            "help-assistant/feedback", 
            200,
            data={
                "session_id": self.session_id,
                "message_id": "test-msg-123",
                "is_helpful": True,
                "question": "How do I create a new form?"
            }
        )
        
        if success:
            self.log(f"   ✅ Feedback recorded: {response}")
            return True
        return False

    def test_help_assistant_analytics(self):
        """Test analytics endpoint"""
        success, response = self.run_test(
            "Help Assistant Analytics",
            "GET",
            "help-assistant/analytics",
            200
        )
        
        if success:
            self.log(f"   📊 Analytics: {response}")
            return True
        return False

    def test_help_assistant_reset(self):
        """Test session reset"""
        if not self.session_id:
            self.log("   ⚠️  No session ID, skipping reset test")
            return False
            
        success, response = self.run_test(
            "AI Assistant Reset",
            "POST",
            f"help-assistant/reset?session_id={self.session_id}",
            200
        )
        
        if success:
            self.log(f"   🔄 Session reset: {response}")
            return True
        return False

    def test_multi_turn_conversation(self):
        """Test multi-turn conversation"""
        # First message
        success1, response1 = self.run_test(
            "Multi-turn Chat (First)",
            "POST",
            "help-assistant/chat",
            200,
            data={"message": "What is FieldForce?"}
        )
        
        if not success1:
            return False
            
        session_id = response1.get('session_id')
        
        # Second message in same session
        success2, response2 = self.run_test(
            "Multi-turn Chat (Follow-up)",
            "POST",
            "help-assistant/chat", 
            200,
            data={"message": "Can you tell me more about collection links?", "session_id": session_id}
        )
        
        if success2:
            response_text = response2.get('response', '')
            self.log(f"   💬 Follow-up response: {response_text[:100]}...")
            return len(response_text) > 20
            
        return False

def main():
    """Run all backend tests"""
    print("=" * 60)
    print("🚀 FieldForce Help Center Backend API Testing")
    print("=" * 60)
    
    tester = HelpCenterAPITester()
    
    # Test authentication first
    tester.log("🔐 Testing Authentication...")
    tester.test_login()  # Always continue regardless of auth result

    tester.log("")
    tester.log("🤖 Testing Help Assistant APIs...")
    
    # Test help assistant endpoints
    test_methods = [
        tester.test_help_assistant_chat,
        tester.test_multi_turn_conversation, 
        tester.test_help_assistant_feedback,
        tester.test_help_assistant_analytics,
        tester.test_help_assistant_reset,
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            tester.log(f"❌ Test {test_method.__name__} failed with exception: {str(e)}")
        tester.log("")

    print_results(tester)
    return 0 if tester.tests_passed == tester.tests_run else 1

def print_results(tester):
    """Print test summary"""
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
    else:
        print("⚠️  SOME TESTS FAILED - Check logs above")
    print("=" * 60)

if __name__ == "__main__":
    sys.exit(main())