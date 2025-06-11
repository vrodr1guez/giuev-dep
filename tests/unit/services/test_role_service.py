import unittest
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from app.services.role_service import CRUDRole, role_service
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate

class TestCRUDRole(unittest.TestCase):

    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_role = CRUDRole() # Test the class directly

    def test_get_role_by_name(self):
        mock_role = Role(id=1, name="admin", description="Administrator Role")
        self.db_session_mock.query(Role).filter(Role.name == "admin").first.return_value = mock_role

        role = self.crud_role.get_role_by_name(self.db_session_mock, name="admin")
        
        self.assertIsNotNone(role)
        self.assertEqual(role.name, "admin")
        self.db_session_mock.query(Role).filter(Role.name == "admin").first.assert_called_once()

    def test_get_role_by_name_not_found(self):
        self.db_session_mock.query(Role).filter(Role.name == "nonexistent").first.return_value = None
        role = self.crud_role.get_role_by_name(self.db_session_mock, name="nonexistent")
        self.assertIsNone(role)

    def test_create_role(self):
        role_create_schema = RoleCreate(
            name="editor", 
            description="Content Editor Role"
        )
        
        created_role_mock = Role(
            id=2,
            name=role_create_schema.name,
            description=role_create_schema.description
        )

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_role_mock.id)

        new_role = self.crud_role.create_role(self.db_session_mock, obj_in=role_create_schema)
            
        self.db_session_mock.add.assert_called_once()
        added_object = self.db_session_mock.add.call_args[0][0]
        self.assertEqual(added_object.name, role_create_schema.name)
        self.assertEqual(added_object.description, role_create_schema.description)
        
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()
        
        self.assertEqual(new_role.name, role_create_schema.name)
        self.assertIsNotNone(new_role.id)
        self.assertEqual(new_role.description, role_create_schema.description)

    def test_get_roles(self):
        mock_roles = [
            Role(id=1, name="admin", description="Admin"),
            Role(id=2, name="editor", description="Editor")
        ]
        self.db_session_mock.query(Role).offset(0).limit(100).all.return_value = mock_roles

        roles = self.crud_role.get_roles(self.db_session_mock, skip=0, limit=100)

        self.assertEqual(len(roles), 2)
        self.assertEqual(roles[0].name, "admin")
        self.db_session_mock.query(Role).offset(0).limit(100).all.assert_called_once()

    def test_update_role(self):
        existing_role = Role(id=1, name="viewer", description="Read-only access")
        role_update_schema = RoleUpdate(name="viewer_updated", description="Updated read-only access")

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.return_value = None # Refresh doesn't change the object in this case

        updated_role = self.crud_role.update_role(self.db_session_mock, db_obj=existing_role, obj_in=role_update_schema)

        self.db_session_mock.add.assert_called_once_with(existing_role)
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once_with(existing_role)

        self.assertEqual(updated_role.name, "viewer_updated")
        self.assertEqual(updated_role.description, "Updated read-only access")

    def test_delete_role(self):
        role_to_delete = Role(id=1, name="obsolete_role")
        self.db_session_mock.query(Role).get(1).return_value = role_to_delete
        self.db_session_mock.delete.return_value = None
        self.db_session_mock.commit.return_value = None

        deleted_role = self.crud_role.delete_role(self.db_session_mock, role_id=1)

        self.db_session_mock.query(Role).get.assert_called_once_with(1)
        self.db_session_mock.delete.assert_called_once_with(role_to_delete)
        self.db_session_mock.commit.assert_called_once()
        self.assertEqual(deleted_role, role_to_delete)

    def test_delete_role_not_found(self):
        self.db_session_mock.query(Role).get(99).return_value = None
        deleted_role = self.crud_role.delete_role(self.db_session_mock, role_id=99)
        self.assertIsNone(deleted_role)
        self.db_session_mock.delete.assert_not_called()

if __name__ == '__main__':
    unittest.main() 