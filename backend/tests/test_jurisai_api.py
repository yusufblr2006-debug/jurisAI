"""
JurisAI Backend API Tests
Tests all API endpoints for the JurisAI legal assistant application
"""
import pytest
import requests
import os
import time

# Get backend URL from environment
# Try multiple possible env var names
BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL') or os.environ.get('EXPO_BACKEND_URL') or ''
BASE_URL = BASE_URL.rstrip('/')
if not BASE_URL:
    # Fallback to reading from frontend .env file
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if 'EXPO_PUBLIC_BACKEND_URL' in line:
                    BASE_URL = line.split('=')[1].strip().strip('"').strip("'")
                    break
    except:
        pass

if not BASE_URL:
    pytest.skip("Backend URL not found in environment", allow_module_level=True)

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_root(self, api_client):
        """Test API root endpoint"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "JurisAI" in data["message"]

class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_create_new_user(self, api_client):
        """Test login creates new user"""
        payload = {
            "name": "TEST_Rahul Sharma",
            "role": "user"
        }
        response = api_client.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["role"] == payload["role"]
    
    def test_login_existing_user(self, api_client):
        """Test login returns existing user"""
        payload = {
            "name": "TEST_Priya Patel",
            "role": "lawyer"
        }
        # First login
        response1 = api_client.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response1.status_code == 200
        user1 = response1.json()
        
        # Second login with same credentials
        response2 = api_client.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response2.status_code == 200
        user2 = response2.json()
        
        # Should return same user ID
        assert user1["id"] == user2["id"]

class TestCases:
    """Case management endpoint tests"""
    
    def test_get_all_cases(self, api_client):
        """Test GET /api/cases returns seeded cases"""
        response = api_client.get(f"{BASE_URL}/api/cases")
        assert response.status_code == 200
        
        cases = response.json()
        assert isinstance(cases, list)
        assert len(cases) >= 2  # At least 2 seeded cases
        
        # Validate first case structure
        case = cases[0]
        required_fields = ["id", "user_id", "title", "description", "status", 
                          "risk_level", "success_probability", "assigned_lawyer", 
                          "case_number", "created_at", "timeline"]
        for field in required_fields:
            assert field in case, f"Missing field: {field}"
        
        # Validate timeline structure
        assert isinstance(case["timeline"], list)
        assert len(case["timeline"]) > 0
        timeline_item = case["timeline"][0]
        assert "step" in timeline_item
        assert "status" in timeline_item
        assert "date" in timeline_item
    
    def test_get_case_by_id(self, api_client):
        """Test GET /api/cases/{id} returns specific case"""
        # First get all cases to get a valid ID
        all_cases = api_client.get(f"{BASE_URL}/api/cases").json()
        assert len(all_cases) > 0
        
        case_id = all_cases[0]["id"]
        response = api_client.get(f"{BASE_URL}/api/cases/{case_id}")
        assert response.status_code == 200
        
        case = response.json()
        assert case["id"] == case_id
        assert "title" in case
        assert "timeline" in case
    
    def test_get_case_not_found(self, api_client):
        """Test GET /api/cases/{id} with invalid ID returns 404"""
        response = api_client.get(f"{BASE_URL}/api/cases/invalid-case-id-12345")
        assert response.status_code == 404

class TestLawyers:
    """Lawyer marketplace endpoint tests"""
    
    def test_get_all_lawyers(self, api_client):
        """Test GET /api/lawyers returns seeded lawyers"""
        response = api_client.get(f"{BASE_URL}/api/lawyers")
        assert response.status_code == 200
        
        lawyers = response.json()
        assert isinstance(lawyers, list)
        assert len(lawyers) >= 5  # At least 5 seeded lawyers
        
        # Validate lawyer structure
        lawyer = lawyers[0]
        required_fields = ["id", "name", "specialty", "tier", "experience_years",
                          "rating", "cases_won", "total_cases", "location", 
                          "avatar_url", "consultation_fee"]
        for field in required_fields:
            assert field in lawyer, f"Missing field: {field}"
        
        # Validate data types
        assert isinstance(lawyer["experience_years"], int)
        assert isinstance(lawyer["rating"], (int, float))
        assert isinstance(lawyer["cases_won"], int)
        assert isinstance(lawyer["total_cases"], int)
        assert isinstance(lawyer["consultation_fee"], int)
        
        # Validate tier values
        assert lawyer["tier"] in ["Platinum", "Gold", "Silver"]

class TestDocuments:
    """Document management endpoint tests"""
    
    def test_get_all_documents(self, api_client):
        """Test GET /api/documents returns seeded documents"""
        response = api_client.get(f"{BASE_URL}/api/documents")
        assert response.status_code == 200
        
        documents = response.json()
        assert isinstance(documents, list)
        assert len(documents) >= 4  # At least 4 seeded documents
        
        # Validate document structure
        doc = documents[0]
        required_fields = ["id", "case_id", "title", "file_type", 
                          "file_size", "uploaded_at", "status"]
        for field in required_fields:
            assert field in doc, f"Missing field: {field}"
        
        # Validate status values
        assert doc["status"] in ["verified", "pending"]

class TestMessages:
    """Chat/messaging endpoint tests"""
    
    def test_get_messages_for_case(self, api_client):
        """Test GET /api/messages/{case_id} returns messages"""
        response = api_client.get(f"{BASE_URL}/api/messages/general")
        assert response.status_code == 200
        
        messages = response.json()
        assert isinstance(messages, list)
        assert len(messages) >= 2  # At least 2 seeded messages
        
        # Validate message structure
        msg = messages[0]
        required_fields = ["id", "case_id", "sender", "text", "timestamp"]
        for field in required_fields:
            assert field in msg, f"Missing field: {field}"
        
        assert msg["case_id"] == "general"
    
    def test_create_message(self, api_client):
        """Test POST /api/messages creates and persists message"""
        payload = {
            "case_id": "general",
            "sender": "user",
            "text": "TEST_This is a test message from pytest"
        }
        
        # Create message
        create_response = api_client.post(f"{BASE_URL}/api/messages", json=payload)
        assert create_response.status_code == 200
        
        created_msg = create_response.json()
        assert created_msg["case_id"] == payload["case_id"]
        assert created_msg["sender"] == payload["sender"]
        assert created_msg["text"] == payload["text"]
        assert "id" in created_msg
        assert "timestamp" in created_msg
        
        # Verify persistence by fetching messages
        get_response = api_client.get(f"{BASE_URL}/api/messages/general")
        assert get_response.status_code == 200
        
        all_messages = get_response.json()
        message_ids = [m["id"] for m in all_messages]
        assert created_msg["id"] in message_ids

class TestAIAnalysis:
    """AI Legal Analysis endpoint tests"""
    
    def test_analyze_legal_issue(self, api_client):
        """Test POST /api/analyze returns AI analysis"""
        payload = {
            "text": "I have a property dispute with my neighbor over boundary walls in Mumbai"
        }
        
        # AI analysis may take a few seconds
        response = api_client.post(f"{BASE_URL}/api/analyze", json=payload, timeout=30)
        assert response.status_code == 200
        
        result = response.json()
        
        # Validate response structure
        required_fields = ["summary", "warnings", "actions", "risk_level", 
                          "success_probability", "strategies"]
        for field in required_fields:
            assert field in result, f"Missing field: {field}"
        
        # Validate data types
        assert isinstance(result["summary"], str)
        assert isinstance(result["warnings"], list)
        assert isinstance(result["actions"], list)
        assert isinstance(result["risk_level"], str)
        assert isinstance(result["success_probability"], int)
        assert isinstance(result["strategies"], list)
        
        # Validate risk level values
        assert result["risk_level"] in ["low", "medium", "high"]
        
        # Validate success probability range
        assert 0 <= result["success_probability"] <= 100
        
        # Validate strategies structure
        if len(result["strategies"]) > 0:
            strategy = result["strategies"][0]
            assert "title" in strategy
            assert "description" in strategy
            assert "pros" in strategy
            assert "cons" in strategy
    
    def test_analyze_with_case_id(self, api_client):
        """Test POST /api/analyze with case_id parameter"""
        payload = {
            "text": "Need legal advice on employment termination without notice",
            "case_id": "test-case-123"
        }
        
        response = api_client.post(f"{BASE_URL}/api/analyze", json=payload, timeout=30)
        assert response.status_code == 200
        
        result = response.json()
        assert "summary" in result
        assert isinstance(result["summary"], str)
        assert len(result["summary"]) > 0

class TestDataIntegrity:
    """Data integrity and validation tests"""
    
    def test_cases_have_valid_timeline_data(self, api_client):
        """Test that all cases have properly structured timeline data"""
        response = api_client.get(f"{BASE_URL}/api/cases")
        cases = response.json()
        
        for case in cases:
            assert "timeline" in case
            assert isinstance(case["timeline"], list)
            assert len(case["timeline"]) > 0
            
            for item in case["timeline"]:
                assert "step" in item
                assert "status" in item
                assert "date" in item
                assert item["status"] in ["completed", "in_progress", "pending"]
    
    def test_lawyers_have_valid_ratings(self, api_client):
        """Test that all lawyers have valid rating values"""
        response = api_client.get(f"{BASE_URL}/api/lawyers")
        lawyers = response.json()
        
        for lawyer in lawyers:
            assert 0.0 <= lawyer["rating"] <= 5.0
            assert lawyer["cases_won"] <= lawyer["total_cases"]
            assert lawyer["experience_years"] > 0
            assert lawyer["consultation_fee"] > 0
