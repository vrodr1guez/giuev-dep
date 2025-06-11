import unittest
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from app.services.organization_service import CRUDOrganization, organization_service
from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate

class TestCRUDOrganization(unittest.TestCase):

    def setUp(self):
        self.db_session_mock = MagicMock(spec=Session)
        self.crud_organization = CRUDOrganization() # Test the class directly

    def test_get_organization_by_name(self):
        mock_organization = Organization(id=1, name="Test Org", description="A test organization")
        self.db_session_mock.query(Organization).filter(Organization.name == "Test Org").first.return_value = mock_organization

        organization = self.crud_organization.get_organization_by_name(self.db_session_mock, name="Test Org")
        
        self.assertIsNotNone(organization)
        self.assertEqual(organization.name, "Test Org")
        self.db_session_mock.query(Organization).filter(Organization.name == "Test Org").first.assert_called_once()

    def test_get_organization_by_name_not_found(self):
        self.db_session_mock.query(Organization).filter(Organization.name == "NonExistent Org").first.return_value = None
        organization = self.crud_organization.get_organization_by_name(self.db_session_mock, name="NonExistent Org")
        self.assertIsNone(organization)

    def test_create_organization(self):
        org_create_schema = OrganizationCreate(
            name="New Org", 
            description="A new test organization"
        )
        
        created_org_mock = Organization(
            id=2,
            name=org_create_schema.name,
            description=org_create_schema.description
        )

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.side_effect = lambda obj: setattr(obj, 'id', created_org_mock.id)

        new_organization = self.crud_organization.create_organization(self.db_session_mock, obj_in=org_create_schema)
            
        self.db_session_mock.add.assert_called_once()
        added_object = self.db_session_mock.add.call_args[0][0]
        self.assertEqual(added_object.name, org_create_schema.name)
        self.assertEqual(added_object.description, org_create_schema.description)
        
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once()
        
        self.assertEqual(new_organization.name, org_create_schema.name)
        self.assertIsNotNone(new_organization.id)
        self.assertEqual(new_organization.description, org_create_schema.description)

    def test_get_organizations(self):
        mock_organizations = [
            Organization(id=1, name="Org Alpha", description="First org"),
            Organization(id=2, name="Org Beta", description="Second org")
        ]
        self.db_session_mock.query(Organization).offset(0).limit(100).all.return_value = mock_organizations

        organizations = self.crud_organization.get_organizations(self.db_session_mock, skip=0, limit=100)

        self.assertEqual(len(organizations), 2)
        self.assertEqual(organizations[0].name, "Org Alpha")
        self.db_session_mock.query(Organization).offset(0).limit(100).all.assert_called_once()

    def test_update_organization(self):
        existing_org = Organization(id=1, name="Old Name Org", description="Old description")
        org_update_schema = OrganizationUpdate(name="Updated Name Org", description="Updated description")

        self.db_session_mock.add.return_value = None
        self.db_session_mock.commit.return_value = None
        self.db_session_mock.refresh.return_value = None

        updated_org = self.crud_organization.update_organization(self.db_session_mock, db_obj=existing_org, obj_in=org_update_schema)

        self.db_session_mock.add.assert_called_once_with(existing_org)
        self.db_session_mock.commit.assert_called_once()
        self.db_session_mock.refresh.assert_called_once_with(existing_org)

        self.assertEqual(updated_org.name, "Updated Name Org")
        self.assertEqual(updated_org.description, "Updated description")

    def test_delete_organization(self):
        org_to_delete = Organization(id=1, name="ToDelete Org")
        self.db_session_mock.query(Organization).get(1).return_value = org_to_delete
        self.db_session_mock.delete.return_value = None
        self.db_session_mock.commit.return_value = None

        deleted_org = self.crud_organization.delete_organization(self.db_session_mock, organization_id=1)

        self.db_session_mock.query(Organization).get.assert_called_once_with(1)
        self.db_session_mock.delete.assert_called_once_with(org_to_delete)
        self.db_session_mock.commit.assert_called_once()
        self.assertEqual(deleted_org, org_to_delete)

    def test_delete_organization_not_found(self):
        self.db_session_mock.query(Organization).get(99).return_value = None
        deleted_org = self.crud_organization.delete_organization(self.db_session_mock, organization_id=99)
        self.assertIsNone(deleted_org)
        self.db_session_mock.delete.assert_not_called()

if __name__ == '__main__':
    unittest.main() 