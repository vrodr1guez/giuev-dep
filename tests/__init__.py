"""
EV Charging Infrastructure Test Suite

This package contains all the tests for the EV Charging Infrastructure application.
Test organization:
- Unit tests: Tests for individual components in isolation
- Integration tests: Tests for component interactions
- API tests: Tests for API endpoints
- E2E tests: End-to-end workflow tests
"""

import os
import sys

# Add the project root to Python path to allow imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Test configuration
DEFAULT_TEST_TIMEOUT = 30  # seconds 