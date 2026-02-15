"""
Help Assistant API Tests - MongoDB-backed AI Assistant

Tests for:
- Chat endpoint (POST /api/help-assistant/chat)
- Feedback endpoint (POST /api/help-assistant/feedback)  
- Analytics endpoint (GET /api/help-assistant/analytics)
- Stats endpoint (GET /api/help-assistant/stats)
- Session history endpoint (GET /api/help-assistant/sessions/{session_id}/history)
- Reset endpoint (POST /api/help-assistant/reset)
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL environment variable not set")


class TestHelpAssistantHealth:
    """Basic health and connectivity tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        print("✓ API health check passed")


class TestHelpAssistantStats:
    """Stats endpoint tests"""
    
    def test_get_stats(self):
        """Test getting overall statistics"""
        response = requests.get(f"{BASE_URL}/api/help-assistant/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "total_sessions" in data
        assert "total_messages" in data
        assert "total_feedback" in data
        assert "helpful_feedback" in data
        assert "not_helpful_feedback" in data
        assert "satisfaction_rate" in data
        assert "sessions_today" in data
        
        # Verify data types
        assert isinstance(data["total_sessions"], int)
        assert isinstance(data["total_messages"], int)
        assert isinstance(data["satisfaction_rate"], (int, float))
        
        print(f"✓ Stats endpoint returns: {data['total_sessions']} sessions, {data['total_messages']} messages")


class TestHelpAssistantAnalytics:
    """Analytics endpoint tests"""
    
    def test_get_analytics(self):
        """Test getting question analytics"""
        response = requests.get(f"{BASE_URL}/api/help-assistant/analytics")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "total_questions" in data
        assert "total_helpful" in data
        assert "total_not_helpful" in data
        assert "top_questions" in data
        assert "needs_improvement" in data
        
        # Verify data types
        assert isinstance(data["total_questions"], int)
        assert isinstance(data["top_questions"], list)
        assert isinstance(data["needs_improvement"], list)
        
        print(f"✓ Analytics endpoint returns: {data['total_questions']} total questions")


class TestHelpAssistantChat:
    """Chat endpoint tests"""
    
    def test_chat_creates_new_session(self):
        """Test that chat without session_id creates new session"""
        response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": "TEST_CHAT: What is FieldForce?"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "response" in data
        assert "session_id" in data
        
        # Verify response content
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0
        assert isinstance(data["session_id"], str)
        
        # Store session_id for subsequent tests
        self.session_id = data["session_id"]
        
        print(f"✓ Chat created new session: {data['session_id'][:8]}...")
        return data["session_id"]
    
    def test_chat_continues_session(self):
        """Test that chat with session_id continues existing session"""
        # First create a session
        create_response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": "TEST_CHAT: Tell me about forms"}
        )
        session_id = create_response.json()["session_id"]
        
        # Continue the conversation
        response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={
                "message": "TEST_CHAT: How do I publish one?",
                "session_id": session_id
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify same session
        assert data["session_id"] == session_id
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0
        
        print(f"✓ Chat continued on session: {session_id[:8]}...")


class TestHelpAssistantSessionHistory:
    """Session history endpoint tests"""
    
    def test_get_session_history(self):
        """Test getting chat history for a session"""
        # First create a session with messages
        create_response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": "TEST_HISTORY: First message"}
        )
        session_id = create_response.json()["session_id"]
        
        # Add another message
        requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={
                "message": "TEST_HISTORY: Second message",
                "session_id": session_id
            }
        )
        
        # Get history
        response = requests.get(f"{BASE_URL}/api/help-assistant/sessions/{session_id}/history")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "session" in data
        assert "messages" in data
        
        # Verify session info
        assert data["session"]["session_id"] == session_id
        assert "created_at" in data["session"]
        assert "message_count" in data["session"]
        
        # Verify messages
        assert isinstance(data["messages"], list)
        assert len(data["messages"]) >= 4  # 2 user + 2 assistant
        
        # Check message structure
        for msg in data["messages"]:
            assert "id" in msg
            assert "session_id" in msg
            assert "role" in msg
            assert "content" in msg
            assert "timestamp" in msg
            assert msg["role"] in ["user", "assistant"]
        
        print(f"✓ Session history has {len(data['messages'])} messages")
    
    def test_get_nonexistent_session_history(self):
        """Test getting history for nonexistent session returns 404"""
        fake_session_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/help-assistant/sessions/{fake_session_id}/history")
        assert response.status_code == 404
        
        print("✓ Nonexistent session returns 404")


class TestHelpAssistantFeedback:
    """Feedback endpoint tests"""
    
    def test_submit_helpful_feedback(self):
        """Test submitting helpful feedback"""
        # First create a session
        create_response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": "TEST_FEEDBACK: How do I use offline mode?"}
        )
        session_id = create_response.json()["session_id"]
        
        # Submit positive feedback
        response = requests.post(
            f"{BASE_URL}/api/help-assistant/feedback",
            json={
                "session_id": session_id,
                "message_id": f"test-msg-{uuid.uuid4()}",
                "is_helpful": True,
                "question": "TEST_FEEDBACK: How do I use offline mode?"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "message" in data
        
        print("✓ Helpful feedback submitted successfully")
    
    def test_submit_not_helpful_feedback(self):
        """Test submitting not helpful feedback"""
        # First create a session
        create_response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": "TEST_FEEDBACK: Complex question about API"}
        )
        session_id = create_response.json()["session_id"]
        
        # Submit negative feedback
        response = requests.post(
            f"{BASE_URL}/api/help-assistant/feedback",
            json={
                "session_id": session_id,
                "message_id": f"test-msg-{uuid.uuid4()}",
                "is_helpful": False,
                "question": "TEST_FEEDBACK: Complex question about API"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        
        print("✓ Not helpful feedback submitted successfully")
    
    def test_feedback_updates_analytics(self):
        """Test that feedback updates question analytics"""
        unique_question = f"TEST_ANALYTICS: Unique question {uuid.uuid4()}"
        
        # Get initial analytics
        initial_response = requests.get(f"{BASE_URL}/api/help-assistant/analytics")
        initial_count = initial_response.json()["total_questions"]
        
        # Create a chat
        create_response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": unique_question}
        )
        session_id = create_response.json()["session_id"]
        
        # Submit feedback with the question
        requests.post(
            f"{BASE_URL}/api/help-assistant/feedback",
            json={
                "session_id": session_id,
                "message_id": f"test-msg-{uuid.uuid4()}",
                "is_helpful": True,
                "question": unique_question
            }
        )
        
        # Check analytics updated
        final_response = requests.get(f"{BASE_URL}/api/help-assistant/analytics")
        final_count = final_response.json()["total_questions"]
        
        assert final_count >= initial_count + 1
        
        print(f"✓ Analytics updated: {initial_count} -> {final_count} questions")


class TestHelpAssistantReset:
    """Reset endpoint tests"""
    
    def test_reset_session(self):
        """Test resetting a chat session"""
        # Create a session
        create_response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": "TEST_RESET: Message to reset"}
        )
        session_id = create_response.json()["session_id"]
        
        # Reset the session
        response = requests.post(
            f"{BASE_URL}/api/help-assistant/reset",
            params={"session_id": session_id}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["session_id"] == session_id
        assert "message" in data
        
        print(f"✓ Session {session_id[:8]}... reset successfully")


class TestHelpAssistantMongoDBPersistence:
    """MongoDB persistence validation tests"""
    
    def test_data_persists_across_requests(self):
        """Verify data persists in MongoDB across multiple requests"""
        # Create a unique session
        unique_msg = f"TEST_PERSIST: Persistence test {uuid.uuid4()}"
        
        create_response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={"message": unique_msg}
        )
        session_id = create_response.json()["session_id"]
        
        # Verify session exists via history endpoint
        history_response = requests.get(f"{BASE_URL}/api/help-assistant/sessions/{session_id}/history")
        assert history_response.status_code == 200
        
        history_data = history_response.json()
        
        # Verify our message is in the history
        user_messages = [m for m in history_data["messages"] if m["role"] == "user"]
        assert any(unique_msg in m["content"] for m in user_messages)
        
        # Verify stats reflect the new session
        stats_response = requests.get(f"{BASE_URL}/api/help-assistant/stats")
        stats_data = stats_response.json()
        assert stats_data["total_sessions"] >= 1
        assert stats_data["total_messages"] >= 2
        
        print("✓ Data persists correctly in MongoDB")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
