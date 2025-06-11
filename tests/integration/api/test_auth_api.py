import unittest
from unittest.mock import patch, MagicMock, PropertyMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import json
from datetime import datetime, timedelta

# Add the project root to the Python path
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from app.main import app
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, create_access_token, verify_password
from app.services.user_service import user_service
from app.services.role_service import role_service
from app.schemas.role import RoleCreate


class MockDBSession:
    """A more sophisticated DB session mock that simulates session operations."""
    
    def __init__(self):
        self.committed = False
        self.rolled_back = False
        self.closed = False
        self._query_results = {}  # Mock query results
        self._added_objects = []
        
    def add(self, obj):
        """Simulate adding an object to the session."""
        self._added_objects.append(obj)
        
    def commit(self):
        """Simulate committing the session."""
        self.committed = True
        
    def rollback(self):
        """Simulate rolling back the session."""
        self.rolled_back = True
        
    def close(self):
        """Simulate closing the session."""
        self.closed = True
        
    def query(self, model):
        """Return a mock query object that can be chained."""
        return MockQuery(self, model)
        
    def register_query_result(self, model, filters, result):
        """Register a result for a specific query."""
        key = (model, tuple(filters) if filters else None)
        self._query_results[key] = result


class MockQuery:
    """Mock SQLAlchemy query object that supports method chaining."""
    
    def __init__(self, session, model):
        self.session = session
        self.model = model
        self._filters = []
        
    def filter(self, *criterion):
        """Add filter criteria and return self for chaining."""
        self._filters.extend(criterion)
        return self
        
    def first(self):
        """Return the first result or None."""
        results = self.all()
        return results[0] if results else None
        
    def all(self):
        """Return all results for the query."""
        key = (self.model, tuple(self._filters) if self._filters else None)
        return self.session._query_results.get(key, [])
        
    def get(self, id_value):
        """Simulate get by primary key."""
        for key, results in self.session._query_results.items():
            if key[0] == self.model:
                for result in results:
                    if hasattr(result, 'id') and result.id == id_value:
                        return result
        return None


# Override database dependency with our mock
def get_test_db():
    """Provide a mock database session for testing."""
    db = MockDBSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = get_test_db
client = TestClient(app)


class TestAuthAPI(unittest.TestCase):
    """Test suite for authentication API endpoints."""

    def setUp(self):
        """Set up test fixtures before each test."""
        self.db_mock = next(get_test_db())
        
        # Common test data
        self.test_email = "test@example.com"
        self.test_password = "StrongPassword123!"
        self.hashed_password = get_password_hash(self.test_password)
        
        # Create test user and role
        self.test_user = User(
            id=1,
            email=self.test_email,
            hashed_password=self.hashed_password,
            first_name="Test",
            last_name="User",
            is_active=True
        )
        
        self.inactive_user = User(
            id=2,
            email="inactive@example.com",
            hashed_password=get_password_hash("password123"),
            first_name="Inactive",
            last_name="User",
            is_active=False
        )
        
        self.default_role = Role(
            id=1,
            name=settings.DEFAULT_USER_ROLE_NAME,
            description="Default user role for testing"
        )

    def tearDown(self):
        """Clean up after each test."""
        app.dependency_overrides.clear()

    def test_login_for_access_token_success(self):
        """Test successful login with valid credentials."""
        # Arrange
        with patch('app.services.user_service.user_service.authenticate') as mock_authenticate:
            mock_authenticate.return_value = self.test_user
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/login/access-token", 
                data={"username": self.test_email, "password": self.test_password}
            )
            
            # Assert
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("access_token", data)
            self.assertEqual(data["token_type"], "bearer")
            self.assertIn("expires_at", data)
            
            # Verify authenticate was called with correct parameters
            mock_authenticate.assert_called_once_with(
                db=self.db_mock,
                email=self.test_email,
                password=self.test_password
            )

    def test_login_for_access_token_wrong_email(self):
        """Test login failure with non-existent email."""
        # Arrange
        with patch('app.services.user_service.user_service.authenticate') as mock_authenticate:
            mock_authenticate.return_value = None  # User not found
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/login/access-token", 
                data={"username": "wrong@example.com", "password": self.test_password}
            )
            
            # Assert
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertIn("detail", data)
            self.assertEqual(data["detail"], "Incorrect email or password")
            
            # Verify authenticate was called with correct parameters
            mock_authenticate.assert_called_once()

    def test_login_for_access_token_wrong_password(self):
        """Test login failure with incorrect password."""
        # Arrange
        with patch('app.services.user_service.user_service.authenticate') as mock_authenticate:
            mock_authenticate.return_value = None  # Authentication failed
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/login/access-token", 
                data={"username": self.test_email, "password": "WrongPassword123!"}
            )
            
            # Assert
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertIn("detail", data)
            self.assertEqual(data["detail"], "Incorrect email or password")

    def test_login_for_access_token_inactive_user(self):
        """Test login attempt with an inactive user account."""
        # Arrange
        with patch('app.services.user_service.user_service.authenticate') as mock_authenticate:
            mock_authenticate.return_value = self.inactive_user
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/login/access-token", 
                data={"username": "inactive@example.com", "password": "password123"}
            )
            
            # Assert
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertIn("detail", data)
            self.assertEqual(data["detail"], "Inactive user")

    def test_login_for_access_token_missing_fields(self):
        """Test login attempt with missing required fields."""
        # Test missing password
        response = client.post(
            f"{settings.API_V1_STR}/login/access-token", 
            data={"username": self.test_email}  # Missing password
        )
        self.assertEqual(response.status_code, 422)
        
        # Test missing email
        response = client.post(
            f"{settings.API_V1_STR}/login/access-token", 
            data={"password": self.test_password}  # Missing username/email
        )
        self.assertEqual(response.status_code, 422)
        
        # Test empty request
        response = client.post(
            f"{settings.API_V1_STR}/login/access-token", 
            data={}  # Empty data
        )
        self.assertEqual(response.status_code, 422)

    def test_create_user_open_success(self):
        """Test successful user creation via the open registration endpoint."""
        # Arrange
        new_user_email = "newuser@example.com"
        new_user_password = "SecurePassword123!"
        new_user_data = {
            "email": new_user_email,
            "password": new_user_password,
            "first_name": "New",
            "last_name": "User"
        }
        
        with patch('app.services.user_service.user_service.get_user_by_email') as mock_get_user_by_email, \
             patch('app.services.role_service.role_service.get_role_by_name') as mock_get_role_by_name, \
             patch('app.services.user_service.user_service.create_user') as mock_create_user:
            
            # Setup mocks
            mock_get_user_by_email.return_value = None  # No existing user
            mock_get_role_by_name.return_value = self.default_role
            
            # Create a mock User instance for the return value
            created_user = User(
                id=3,
                email=new_user_email,
                hashed_password=get_password_hash(new_user_password),
                first_name="New",
                last_name="User",
                is_active=True
            )
            created_user.roles = [self.default_role]  # Add default role
            mock_create_user.return_value = created_user
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/users/open", 
                json=new_user_data
            )
            
            # Assert
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["email"], new_user_email)
            self.assertEqual(data["first_name"], "New")
            self.assertEqual(data["last_name"], "User")
            self.assertTrue(data["is_active"])
            self.assertNotIn("password", data)  # Password should never be returned
            
            # Verify service calls were made correctly
            mock_get_user_by_email.assert_called_once_with(self.db_mock, email=new_user_email)
            mock_get_role_by_name.assert_called_once_with(self.db_mock, name=settings.DEFAULT_USER_ROLE_NAME)
            
            # Verify the user creation call with correct parameters
            mock_create_user.assert_called_once()
            args, kwargs = mock_create_user.call_args
            self.assertEqual(kwargs["db"], self.db_mock)
            self.assertIsInstance(kwargs["obj_in"], UserCreate)
            self.assertEqual(kwargs["obj_in"].email, new_user_email)
            self.assertEqual(kwargs["role_id"], self.default_role.id)

    def test_create_user_open_email_exists(self):
        """Test user creation failure when email already exists."""
        # Arrange
        existing_user_email = self.test_email
        user_data = {
            "email": existing_user_email,
            "password": "NewPassword123!",
            "first_name": "Existing",
            "last_name": "User"
        }
        
        with patch('app.services.user_service.user_service.get_user_by_email') as mock_get_user_by_email:
            mock_get_user_by_email.return_value = self.test_user  # Email exists
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/users/open", 
                json=user_data
            )
            
            # Assert
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertIn("detail", data)
            self.assertEqual(data["detail"], "Email already registered")
            
            # Verify service call
            mock_get_user_by_email.assert_called_once_with(self.db_mock, email=existing_user_email)

    def test_create_user_open_invalid_data(self):
        """Test user creation with invalid data formats."""
        # Test with invalid email format
        invalid_email_data = {
            "email": "notanemail",  # Invalid email format
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User"
        }
        response = client.post(
            f"{settings.API_V1_STR}/users/open", 
            json=invalid_email_data
        )
        self.assertEqual(response.status_code, 422)  # Validation error
        
        # Test with password too short
        short_password_data = {
            "email": "valid@example.com",
            "password": "short",  # Too short
            "first_name": "Test",
            "last_name": "User"
        }
        response = client.post(
            f"{settings.API_V1_STR}/users/open", 
            json=short_password_data
        )
        self.assertEqual(response.status_code, 422)  # Validation error
        
        # Test with missing required field
        missing_field_data = {
            "email": "valid@example.com",
            "password": "ValidPassword123!"
            # Missing first_name and last_name
        }
        response = client.post(
            f"{settings.API_V1_STR}/users/open", 
            json=missing_field_data
        )
        self.assertEqual(response.status_code, 422)  # Validation error

    def test_reset_password_request(self):
        """Test requesting a password reset."""
        # Arrange - this would normally create a token and send an email
        with patch('app.services.user_service.user_service.get_user_by_email') as mock_get_user_by_email, \
             patch('app.services.user_service.user_service.generate_password_reset_token') as mock_generate_token, \
             patch('app.services.user_service.user_service.send_reset_password_email') as mock_send_email:
            
            mock_get_user_by_email.return_value = self.test_user
            mock_generate_token.return_value = "test-reset-token"
            mock_send_email.return_value = None  # Successful email send
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/password-recovery/{self.test_email}"
            )
            
            # Assert
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("msg", data)
            self.assertIn("Password recovery email sent", data["msg"])
            
            # Verify service calls
            mock_get_user_by_email.assert_called_once_with(self.db_mock, email=self.test_email)
            mock_generate_token.assert_called_once()
            mock_send_email.assert_called_once()

    def test_reset_password_nonexistent_email(self):
        """Test requesting a password reset for a non-existent email."""
        # Arrange
        non_existent_email = "nonexistent@example.com"
        with patch('app.services.user_service.user_service.get_user_by_email') as mock_get_user_by_email:
            mock_get_user_by_email.return_value = None  # User not found
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/password-recovery/{non_existent_email}"
            )
            
            # Assert - Should still return 200 for security (don't reveal which emails exist)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("msg", data)
            self.assertIn("Password recovery email sent", data["msg"])
            
            # Verify service call
            mock_get_user_by_email.assert_called_once_with(self.db_mock, email=non_existent_email)

    def test_reset_password_confirm(self):
        """Test resetting a password with a valid token."""
        # Arrange
        token = "valid-reset-token"
        new_password = "NewSecurePassword123!"
        reset_data = {
            "token": token,
            "new_password": new_password
        }
        
        with patch('app.services.user_service.user_service.verify_password_reset_token') as mock_verify_token, \
             patch('app.services.user_service.user_service.get_user_by_email') as mock_get_user_by_email, \
             patch('app.services.user_service.user_service.update_user_password') as mock_update_password:
            
            mock_verify_token.return_value = self.test_email  # Token verifies to this email
            mock_get_user_by_email.return_value = self.test_user
            mock_update_password.return_value = self.test_user  # Updated user
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/reset-password/",
                json=reset_data
            )
            
            # Assert
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("msg", data)
            self.assertIn("Password updated successfully", data["msg"])
            
            # Verify service calls
            mock_verify_token.assert_called_once_with(token)
            mock_get_user_by_email.assert_called_once_with(self.db_mock, email=self.test_email)
            mock_update_password.assert_called_once_with(
                self.db_mock, 
                self.test_user, 
                new_password
            )

    def test_reset_password_invalid_token(self):
        """Test resetting a password with an invalid token."""
        # Arrange
        token = "invalid-reset-token"
        new_password = "NewSecurePassword123!"
        reset_data = {
            "token": token,
            "new_password": new_password
        }
        
        with patch('app.services.user_service.user_service.verify_password_reset_token') as mock_verify_token:
            mock_verify_token.return_value = None  # Invalid token
            
            # Act
            response = client.post(
                f"{settings.API_V1_STR}/reset-password/",
                json=reset_data
            )
            
            # Assert
            self.assertEqual(response.status_code, 400)
            data = response.json()
            self.assertIn("detail", data)
            self.assertEqual(data["detail"], "Invalid password reset token")
            
            # Verify service call
            mock_verify_token.assert_called_once_with(token)

    @patch('app.core.security.verify_password')
    def test_test_password_strength(self, mock_verify_password):
        """Test the password strength checking endpoint."""
        # Arrange
        mock_verify_password.return_value = True  # Simulate password verification
        
        # Test a strong password
        strong_password_data = {"password": "StrongP@ssw0rd123!"}
        
        # Act
        response = client.post(
            f"{settings.API_V1_STR}/test-password-strength/",
            json=strong_password_data
        )
        
        # Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("strength", data)
        self.assertGreater(data["strength"], 0.7)  # Strong passwords should have high strength
        
        # Test a weak password
        weak_password_data = {"password": "password"}
        response = client.post(
            f"{settings.API_V1_STR}/test-password-strength/",
            json=weak_password_data
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("strength", data)
        self.assertLess(data["strength"], 0.4)  # Weak passwords should have low strength


if __name__ == "__main__":
    unittest.main() 