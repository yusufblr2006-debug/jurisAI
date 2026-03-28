#!/usr/bin/env python3
"""
JurisAI Backend API Testing Suite
Tests all backend endpoints for the JurisAI legal assistant application.
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from frontend environment
BACKEND_URL = "https://lawtech-india-1.preview.emergentagent.com/api"

# Test credentials from test_credentials.md
TEST_USER = {
    "email": "arjun@test.com",
    "password": "test123",
    "name": "Arjun Sharma"
}

ADMIN_USER = {
    "email": "admin@jurisai.com", 
    "password": "admin123"
}

class JurisAITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{BACKEND_URL}{endpoint}"
        req_headers = {"Content-Type": "application/json"}
        
        if headers:
            req_headers.update(headers)
            
        if self.auth_token and "Authorization" not in req_headers:
            req_headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=req_headers, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=req_headers, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=req_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=req_headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}", 400
                
            try:
                response_data = response.json()
            except:
                response_data = response.text
                
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.Timeout:
            return False, "Request timeout", 408
        except requests.exceptions.ConnectionError:
            return False, "Connection error", 503
        except Exception as e:
            return False, str(e), 500

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, data, status = self.make_request("GET", "/")
        if success and isinstance(data, dict) and "message" in data:
            self.log_result("Root Endpoint", True, f"API is active: {data.get('message')}")
        else:
            self.log_result("Root Endpoint", False, f"Failed to connect to API", data)

    def test_auth_register(self):
        """Test user registration"""
        # Try registering a new user with unique email
        import uuid
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        
        register_data = {
            "name": "Test User",
            "email": unique_email,
            "password": "testpass123",
            "role": "user"
        }
        
        success, data, status = self.make_request("POST", "/auth/register", register_data)
        
        if success and isinstance(data, dict) and "token" in data:
            self.log_result("Auth Register", True, f"User registered successfully: {data.get('email')}")
        else:
            self.log_result("Auth Register", False, f"Registration failed (status: {status})", data)

    def test_auth_login(self):
        """Test user login with test credentials"""
        success, data, status = self.make_request("POST", "/auth/login", TEST_USER)
        
        if success and isinstance(data, dict) and "token" in data:
            self.auth_token = data["token"]
            self.log_result("Auth Login", True, f"Login successful for {data.get('email')}")
            return True
        else:
            self.log_result("Auth Login", False, f"Login failed (status: {status})", data)
            return False

    def test_auth_me(self):
        """Test getting current user info"""
        if not self.auth_token:
            self.log_result("Auth Me", False, "No auth token available")
            return
            
        success, data, status = self.make_request("GET", "/auth/me")
        
        if success and isinstance(data, dict) and "email" in data:
            self.log_result("Auth Me", True, f"User info retrieved: {data.get('email')}")
        else:
            self.log_result("Auth Me", False, f"Failed to get user info (status: {status})", data)

    def test_cases_list(self):
        """Test getting list of cases"""
        success, data, status = self.make_request("GET", "/cases")
        
        if success and isinstance(data, list):
            self.log_result("Cases List", True, f"Retrieved {len(data)} cases")
            return data
        else:
            self.log_result("Cases List", False, f"Failed to get cases (status: {status})", data)
            return []

    def test_cases_get_single(self, cases_data):
        """Test getting a single case"""
        if not cases_data:
            self.log_result("Cases Get Single", False, "No cases available to test")
            return
            
        case_id = cases_data[0].get("id")
        if not case_id:
            self.log_result("Cases Get Single", False, "No case ID found")
            return
            
        success, data, status = self.make_request("GET", f"/cases/{case_id}")
        
        if success and isinstance(data, dict) and data.get("id") == case_id:
            self.log_result("Cases Get Single", True, f"Retrieved case: {data.get('title')}")
        else:
            self.log_result("Cases Get Single", False, f"Failed to get case (status: {status})", data)

    def test_cases_create(self):
        """Test creating a new case"""
        case_data = {
            "title": "Test Legal Case - Property Dispute",
            "description": "Testing case creation for property boundary dispute in Mumbai",
            "category": "Property"
        }
        
        success, data, status = self.make_request("POST", "/cases", case_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.log_result("Cases Create", True, f"Case created: {data.get('title')}")
        else:
            self.log_result("Cases Create", False, f"Failed to create case (status: {status})", data)

    def test_ai_legal_analysis(self):
        """Test AI legal analysis endpoint"""
        analysis_data = {
            "text": "I have a property dispute with my neighbor over boundary walls. They have encroached 2 feet into my land and built a wall. I have property documents proving ownership. What legal action can I take?"
        }
        
        success, data, status = self.make_request("POST", "/analyze", analysis_data)
        
        if success and isinstance(data, dict) and "summary" in data:
            self.log_result("AI Legal Analysis", True, f"Analysis completed: {data.get('risk_level')} risk")
        else:
            self.log_result("AI Legal Analysis", False, f"Analysis failed (status: {status})", data)

    def test_evidence_analysis(self):
        """Test evidence analysis endpoint"""
        evidence_data = {
            "text": "Property sale deed dated 15th March 2020, registered with Sub-Registrar Office Mumbai. Document shows clear ownership transfer from Ramesh Kumar to Arjun Sharma for Plot No. 123, Survey No. 456, measuring 1200 sq ft.",
            "evidence_type": "document"
        }
        
        success, data, status = self.make_request("POST", "/evidence/analyze", evidence_data)
        
        if success and isinstance(data, dict) and "summary" in data:
            self.log_result("Evidence Analysis", True, f"Evidence analyzed: strength score {data.get('strength_score', 'N/A')}")
        else:
            self.log_result("Evidence Analysis", False, f"Evidence analysis failed (status: {status})", data)

    def test_lawyers_list(self):
        """Test getting list of lawyers"""
        success, data, status = self.make_request("GET", "/lawyers")
        
        if success and isinstance(data, list):
            self.log_result("Lawyers List", True, f"Retrieved {len(data)} lawyers")
            return data
        else:
            self.log_result("Lawyers List", False, f"Failed to get lawyers (status: {status})", data)
            return []

    def test_lawyers_filter(self):
        """Test filtering lawyers by specialty"""
        success, data, status = self.make_request("GET", "/lawyers?specialty=Criminal%20Law")
        
        if success and isinstance(data, list):
            criminal_lawyers = [l for l in data if "Criminal Law" in l.get("specialty", [])]
            self.log_result("Lawyers Filter", True, f"Found {len(criminal_lawyers)} criminal law specialists")
        else:
            self.log_result("Lawyers Filter", False, f"Failed to filter lawyers (status: {status})", data)

    def test_lawyers_get_single(self, lawyers_data):
        """Test getting a single lawyer"""
        if not lawyers_data:
            self.log_result("Lawyers Get Single", False, "No lawyers available to test")
            return
            
        lawyer_id = lawyers_data[0].get("id")
        if not lawyer_id:
            self.log_result("Lawyers Get Single", False, "No lawyer ID found")
            return
            
        success, data, status = self.make_request("GET", f"/lawyers/{lawyer_id}")
        
        if success and isinstance(data, dict) and data.get("id") == lawyer_id:
            self.log_result("Lawyers Get Single", True, f"Retrieved lawyer: {data.get('name')}")
        else:
            self.log_result("Lawyers Get Single", False, f"Failed to get lawyer (status: {status})", data)

    def test_community_posts_list(self):
        """Test getting community posts"""
        success, data, status = self.make_request("GET", "/community/posts")
        
        if success and isinstance(data, list):
            self.log_result("Community Posts List", True, f"Retrieved {len(data)} community posts")
            return data
        else:
            self.log_result("Community Posts List", False, f"Failed to get posts (status: {status})", data)
            return []

    def test_community_posts_create(self):
        """Test creating a community post"""
        post_data = {
            "title": "Test Question - Tenant Rights in Mumbai",
            "category": "Property",
            "content": "What are the rights of tenants under Maharashtra Rent Control Act? My landlord is asking me to vacate without proper notice."
        }
        
        success, data, status = self.make_request("POST", "/community/posts", post_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.log_result("Community Posts Create", True, f"Post created: {data.get('title')}")
            return data.get("id")
        else:
            self.log_result("Community Posts Create", False, f"Failed to create post (status: {status})", data)
            return None

    def test_community_posts_reply(self, post_id):
        """Test replying to a community post"""
        if not post_id:
            self.log_result("Community Posts Reply", False, "No post ID available")
            return
            
        reply_data = {
            "content": "Under Maharashtra Rent Control Act, landlord must give 15 days notice for eviction. You should consult a property lawyer for specific advice.",
            "is_lawyer": False
        }
        
        success, data, status = self.make_request("POST", f"/community/posts/{post_id}/reply", reply_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.log_result("Community Posts Reply", True, "Reply posted successfully")
        else:
            self.log_result("Community Posts Reply", False, f"Failed to post reply (status: {status})", data)

    def test_notifications_list(self):
        """Test getting notifications"""
        success, data, status = self.make_request("GET", "/notifications")
        
        if success and isinstance(data, list):
            self.log_result("Notifications List", True, f"Retrieved {len(data)} notifications")
            return data
        else:
            self.log_result("Notifications List", False, f"Failed to get notifications (status: {status})", data)
            return []

    def test_notifications_mark_read(self, notifications_data):
        """Test marking a notification as read"""
        if not notifications_data:
            self.log_result("Notifications Mark Read", False, "No notifications available")
            return
            
        notif_id = notifications_data[0].get("id")
        if not notif_id:
            self.log_result("Notifications Mark Read", False, "No notification ID found")
            return
            
        success, data, status = self.make_request("POST", f"/notifications/{notif_id}/read")
        
        if success and isinstance(data, dict) and data.get("status") == "ok":
            self.log_result("Notifications Mark Read", True, "Notification marked as read")
        else:
            self.log_result("Notifications Mark Read", False, f"Failed to mark notification (status: {status})", data)

    def test_notifications_mark_all_read(self):
        """Test marking all notifications as read"""
        success, data, status = self.make_request("POST", "/notifications/read-all")
        
        if success and isinstance(data, dict) and data.get("status") == "ok":
            self.log_result("Notifications Mark All Read", True, "All notifications marked as read")
        else:
            self.log_result("Notifications Mark All Read", False, f"Failed to mark all notifications (status: {status})", data)

    def test_messages_list(self):
        """Test getting messages for general case"""
        success, data, status = self.make_request("GET", "/messages/general")
        
        if success and isinstance(data, list):
            self.log_result("Messages List", True, f"Retrieved {len(data)} messages")
        else:
            self.log_result("Messages List", False, f"Failed to get messages (status: {status})", data)

    def test_messages_create(self):
        """Test creating a message"""
        message_data = {
            "case_id": "general",
            "sender": "user",
            "text": "Test message - I need help with understanding property registration process in Maharashtra."
        }
        
        success, data, status = self.make_request("POST", "/messages", message_data)
        
        if success and isinstance(data, dict) and "id" in data:
            self.log_result("Messages Create", True, f"Message created successfully")
        else:
            self.log_result("Messages Create", False, f"Failed to create message (status: {status})", data)

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting JurisAI Backend API Tests")
        print("=" * 50)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test authentication (high priority)
        print("\n📋 Testing Authentication APIs...")
        self.test_auth_register()
        login_success = self.test_auth_login()
        if login_success:
            self.test_auth_me()
        
        # Test cases CRUD (high priority)
        print("\n📋 Testing Cases APIs...")
        cases_data = self.test_cases_list()
        self.test_cases_get_single(cases_data)
        self.test_cases_create()
        
        # Test AI analysis (high priority)
        print("\n📋 Testing AI Analysis APIs...")
        self.test_ai_legal_analysis()
        
        # Test lawyers (high priority)
        print("\n📋 Testing Lawyers APIs...")
        lawyers_data = self.test_lawyers_list()
        self.test_lawyers_filter()
        self.test_lawyers_get_single(lawyers_data)
        
        # Test community (medium priority)
        print("\n📋 Testing Community APIs...")
        posts_data = self.test_community_posts_list()
        post_id = self.test_community_posts_create()
        self.test_community_posts_reply(post_id)
        
        # Test notifications (medium priority)
        print("\n📋 Testing Notifications APIs...")
        notifications_data = self.test_notifications_list()
        self.test_notifications_mark_read(notifications_data)
        self.test_notifications_mark_all_read()
        
        # Test messages (medium priority)
        print("\n📋 Testing Messages APIs...")
        self.test_messages_list()
        self.test_messages_create()
        
        # Test evidence analysis (low priority)
        print("\n📋 Testing Evidence Analysis APIs...")
        self.test_evidence_analysis()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for r in self.test_results if r["success"])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        print("\n" + "=" * 50)

if __name__ == "__main__":
    tester = JurisAITester()
    tester.run_all_tests()