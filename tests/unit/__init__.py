"""
Unit Test Package

This package contains unit tests that test individual components in isolation.
Unit tests should be fast, isolated, and independent of external resources.
"""

import pytest
from unittest import mock


# Common mock fixtures for unit tests
@pytest.fixture
def mock_db_session():
    """Mock database session for unit tests."""
    session = mock.MagicMock()
    yield session


@pytest.fixture
def mock_current_user():
    """Mock authenticated user for unit tests."""
    return {
        "id": 1,
        "email": "test@example.com",
        "organization_id": 1,
        "role": "admin"
    }


# Test utilities for common operations
def assert_called_with_matching_kwargs(mock_call, **expected_kwargs):
    """Assert that a mock was called with specific keyword arguments."""
    actual_kwargs = mock_call.call_args.kwargs
    for key, value in expected_kwargs.items():
        assert key in actual_kwargs, f"Expected '{key}' in kwargs but not found"
        assert actual_kwargs[key] == value, f"Expected '{key}={value}', got '{key}={actual_kwargs[key]}'" 