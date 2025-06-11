import unittest
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from app.services.user_service import CRUDUser, user_service
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

class TestCRUDUser(unittest.TestCase):

    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_user = CRUDUser() # Test the class directly

    def test_get_user_by_email(self):
        mock_user = User(id=1, email="test@example.com", hashed_password="hashed_pw")
        self.db_session_mock.query(User).filter(User.email == "test@example.com").first.return_value = mock_user

        user = self.crud_user.get_user_by_email(self.db_session_mock, email="test@example.com")
        
        self.assertIsNotNone(user)
        self.assertEqual(user.email, "test@example.com")
        self.db_session_mock.query(User).filter(User.email == "test@example.com").first.assert_called_once()

    def test_get_user_by_email_not_found(self):
        self.db_session_mock.query(User).filter(User.email == "nonexistent@example.com").first.return_value = None
        user = self.crud_user.get_user_by_email(self.db_session_mock, email="nonexistent@example.com")
        self.assertIsNone(user)

    def test_create_user(self):
        user_create_schema = UserCreate(
            email="newuser@example.com", 
            password="password123",
            first_name="New",
            last_name="User",
            is_active=True
        )
        
        # Mock the get_password_hash function if it's called within create_user
        # For this example, assuming it's directly used or User model handles it.
        # If User model constructor calls get_password_hash, that needs to be considered.

        created_user_mock = User(
            id=2,
            email=user_create_schema.email,
            hashed_password=get_password_hash(user_create_schema.password), # Simulate hashing
            first_name=user_create_schema.first_name,
            last_name=user_create_schema.last_name,
            is_active=user_create_schema.is_active
        )

        # Configure the mock session to behave as expected
        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_user_mock.id) # Simulate refresh setting an ID

        # Patch get_password_hash if it's directly called by the service
        with patch('app.services.user_service.get_password_hash', return_value="hashed_new_password") as mock_hash:
            db_obj = User(
                email=user_create_schema.email,
                hashed_password=mock_hash(user_create_schema.password), # This is what create_user will do
                first_name=user_create_schema.first_name,
                last_name=user_create_schema.last_name,
                is_active=user_create_schema.is_active
            )
            # Simulate the service creating the user object
            # No, the service itself creates the db_obj, so we just check its calls

            new_user = self.crud_user.create_user(self.db_session_mock, obj_in=user_create_schema)
            
            mock_hash.assert_called_once_with(user_create_schema.password)
            self.db_session_mock.add.assert_called_once()
            # The object passed to add should have the hashed password from the mock_hash
            added_object = self.db_session_mock.add.call_args[0][0]
            self.assertEqual(added_object.email, user_create_schema.email)
            self.assertEqual(added_object.hashed_password, "hashed_new_password")
            
            self.db_session_mock.commit.assert_called_once()
            self.db_session_mock.refresh.assert_called_once()
            
            self.assertEqual(new_user.email, user_create_schema.email)
            self.assertIsNotNone(new_user.id) # Check if ID was set by refresh mock
            self.assertEqual(new_user.hashed_password, "hashed_new_password")

    def test_authenticate_user_success(self):
        email = "authuser@example.com"
        password = "correctpassword"
        hashed_password = get_password_hash(password)
        mock_user_db = User(id=3, email=email, hashed_password=hashed_password, is_active=True)

        self.db_session_mock.query(User).filter(User.email == email).first.return_value = mock_user_db
        
        with patch('app.services.user_service.verify_password', return_value=True) as mock_verify:
            authenticated_user = self.crud_user.authenticate(self.db_session_mock, email=email, password=password)
            mock_verify.assert_called_once_with(password, hashed_password)
            self.assertIsNotNone(authenticated_user)
            self.assertEqual(authenticated_user.email, email)

    def test_authenticate_user_wrong_password(self):
        email = "authuser@example.com"
        password = "wrongpassword"
        correct_hashed_password = get_password_hash("correctpassword")
        mock_user_db = User(id=3, email=email, hashed_password=correct_hashed_password, is_active=True)

        self.db_session_mock.query(User).filter(User.email == email).first.return_value = mock_user_db
        
        with patch('app.services.user_service.verify_password', return_value=False) as mock_verify:
            authenticated_user = self.crud_user.authenticate(self.db_session_mock, email=email, password=password)
            mock_verify.assert_called_once_with(password, correct_hashed_password)
            self.assertIsNone(authenticated_user)

    def test_authenticate_user_not_found(self):
        email = "nonexistent@example.com"
        password = "anypassword"
        self.db_session_mock.query(User).filter(User.email == email).first.return_value = None
        
        authenticated_user = self.crud_user.authenticate(self.db_session_mock, email=email, password=password)
        self.assertIsNone(authenticated_user)

    def test_is_active(self):
        active_user = User(is_active=True)
        inactive_user = User(is_active=False)
        self.assertTrue(self.crud_user.is_active(active_user))
        self.assertFalse(self.crud_user.is_active(inactive_user))

if __name__ == '__main__':
    unittest.main() 