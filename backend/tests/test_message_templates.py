"""
Message Templates API Tests
Tests CRUD operations for custom message templates feature.
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("REACT_APP_BACKEND_URL environment variable is required")


class TestMessageTemplatesAPI:
    """Test suite for /api/message-templates endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@fieldforce.io",
            "password": "Test123!"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        self.created_template_ids = []
        yield
        # Cleanup: Delete test templates
        for template_id in self.created_template_ids:
            try:
                requests.delete(
                    f"{BASE_URL}/api/message-templates/{template_id}",
                    headers=self.headers
                )
            except:
                pass
    
    def test_list_templates_returns_system_templates(self):
        """GET /api/message-templates - Should return seeded system templates"""
        response = requests.get(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have at least 5 system templates
        system_templates = [t for t in data if t.get("scope") == "system"]
        assert len(system_templates) >= 5, f"Expected at least 5 system templates, got {len(system_templates)}"
        
        # Verify expected templates exist
        template_names = [t["name"] for t in system_templates]
        assert "WhatsApp - Friendly" in template_names
        assert "WhatsApp - Professional" in template_names
        assert "Email - Standard" in template_names
        assert "SMS - Short" in template_names
        assert "SMS - With Instructions" in template_names
        
        # Verify template structure
        for template in system_templates:
            assert "id" in template
            assert "name" in template
            assert "type" in template
            assert "body" in template
            assert "scope" in template
            assert template["is_default"] == True
    
    def test_list_templates_filter_by_type(self):
        """GET /api/message-templates?type=whatsapp - Filter by type"""
        response = requests.get(
            f"{BASE_URL}/api/message-templates?type=whatsapp",
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned templates should be whatsapp type
        for template in data:
            assert template["type"] == "whatsapp"
    
    def test_create_user_template(self):
        """POST /api/message-templates - Create personal template"""
        payload = {
            "name": "TEST_Personal WhatsApp",
            "type": "whatsapp",
            "body": "Hi {name}! Your link: {link}. Expires {expiry}.",
            "scope": "user"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers,
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Track for cleanup
        self.created_template_ids.append(data["id"])
        
        # Verify response
        assert data["name"] == payload["name"]
        assert data["type"] == payload["type"]
        assert data["body"] == payload["body"]
        assert data["scope"] == "user"
        assert data["is_default"] == False
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
    
    def test_create_email_template_with_subject(self):
        """POST /api/message-templates - Email template includes subject"""
        payload = {
            "name": "TEST_Email Template",
            "type": "email",
            "subject": "Your Collection Link for {name}",
            "body": "Dear {name},\n\nPlease use this link: {link}\n\nExpires: {expiry}",
            "scope": "user"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers,
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        self.created_template_ids.append(data["id"])
        
        assert data["subject"] == payload["subject"]
        assert data["type"] == "email"
    
    def test_create_template_validation(self):
        """POST /api/message-templates - Validation errors"""
        # Missing required fields
        response = requests.post(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers,
            json={"name": ""}  # Empty name
        )
        assert response.status_code == 422  # Validation error
        
        # Missing body
        response = requests.post(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers,
            json={"name": "Test", "body": ""}
        )
        assert response.status_code == 422
    
    def test_update_user_template(self):
        """PUT /api/message-templates/{id} - Update own template"""
        # First create a template
        create_response = requests.post(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers,
            json={
                "name": "TEST_Template to Update",
                "type": "sms",
                "body": "Original body",
                "scope": "user"
            }
        )
        assert create_response.status_code == 200
        template_id = create_response.json()["id"]
        self.created_template_ids.append(template_id)
        
        # Update it
        update_response = requests.put(
            f"{BASE_URL}/api/message-templates/{template_id}",
            headers=self.headers,
            json={
                "name": "TEST_Updated Template Name",
                "body": "Updated body with {name} and {link}"
            }
        )
        
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["name"] == "TEST_Updated Template Name"
        assert data["body"] == "Updated body with {name} and {link}"
        
        # Verify update persisted
        get_response = requests.get(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers
        )
        templates = get_response.json()
        updated = next((t for t in templates if t["id"] == template_id), None)
        assert updated is not None
        assert updated["name"] == "TEST_Updated Template Name"
    
    def test_cannot_update_system_template(self):
        """PUT /api/message-templates/{id} - Cannot modify system templates"""
        # Get a system template ID
        response = requests.get(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers
        )
        templates = response.json()
        system_template = next((t for t in templates if t["scope"] == "system"), None)
        assert system_template is not None
        
        # Try to update it
        update_response = requests.put(
            f"{BASE_URL}/api/message-templates/{system_template['id']}",
            headers=self.headers,
            json={"name": "Hacked Name"}
        )
        
        assert update_response.status_code == 403
        assert "Cannot modify system templates" in update_response.json().get("detail", "")
    
    def test_delete_user_template(self):
        """DELETE /api/message-templates/{id} - Delete own template"""
        # Create a template
        create_response = requests.post(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers,
            json={
                "name": "TEST_Template to Delete",
                "type": "whatsapp",
                "body": "Delete me",
                "scope": "user"
            }
        )
        assert create_response.status_code == 200
        template_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/message-templates/{template_id}",
            headers=self.headers
        )
        
        assert delete_response.status_code == 200
        assert delete_response.json()["success"] == True
        
        # Verify it's gone
        get_response = requests.get(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers
        )
        templates = get_response.json()
        deleted = next((t for t in templates if t["id"] == template_id), None)
        assert deleted is None
    
    def test_cannot_delete_system_template(self):
        """DELETE /api/message-templates/{id} - Cannot delete system templates"""
        # Get a system template ID
        response = requests.get(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers
        )
        templates = response.json()
        system_template = next((t for t in templates if t["scope"] == "system"), None)
        assert system_template is not None
        
        # Try to delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/message-templates/{system_template['id']}",
            headers=self.headers
        )
        
        assert delete_response.status_code == 403
        assert "Cannot delete system templates" in delete_response.json().get("detail", "")
    
    def test_template_variables_in_body(self):
        """Verify template body can contain variables"""
        payload = {
            "name": "TEST_Variables Template",
            "type": "whatsapp",
            "body": "Hi {name}! Link: {link}\n{pin_section}Valid until: {expiry}",
            "scope": "user"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/message-templates",
            headers=self.headers,
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        self.created_template_ids.append(data["id"])
        
        # Verify variables are preserved
        assert "{name}" in data["body"]
        assert "{link}" in data["body"]
        assert "{pin_section}" in data["body"]
        assert "{expiry}" in data["body"]
