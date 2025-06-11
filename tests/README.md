# EV Charging Infrastructure Test Suite

This directory contains comprehensive test coverage for the GIU EV Charging Infrastructure application. The test suite is divided into unit tests (testing individual components in isolation) and integration tests (testing component interactions).

## Test Structure

```
tests/
├── unit/                     # Unit tests
│   ├── services/             # Service layer unit tests
│   ├── models/               # Model unit tests
│   └── schemas/              # Schema validation tests
├── integration/              # Integration tests
│   ├── api/                  # API endpoint tests
│   └── db/                   # Database integration tests
└── run_tests.py              # Test runner script
```

## Running Tests

### Running All Tests

To run all tests in the project:

```bash
python tests/run_tests.py
```

### Running Specific Test Modules

To run tests from a specific module:

```bash
python tests/run_tests.py tests/unit/services/test_user_service.py
# OR
python tests/run_tests.py tests.unit.services.test_user_service
```

## Writing New Tests

### Unit Tests

Unit tests should follow these guidelines:

1. Use `unittest.mock` to isolate the component under test
2. Follow the Arrange-Act-Assert pattern
3. Test both success and error scenarios
4. Include docstrings explaining what each test does

Example:

```python
def test_create_user_success(self):
    """Test successful user creation."""
    # Arrange
    user_data = {"email": "test@example.com", "password": "secure123"}
    
    # Act
    result = self.service.create_user(user_data)
    
    # Assert
    self.assertIsNotNone(result.id)
    self.assertEqual(result.email, "test@example.com")
```

### Integration Tests

Integration tests should:

1. Use TestClient for API tests
2. Mock external dependencies if needed
3. Use a test database or transaction rollbacks to avoid persistence
4. Test the complete flow and include assertions on the response status and data

## Test Dependencies

The test suite relies on:

- unittest: Python's built-in testing framework
- unittest.mock: For mocking dependencies
- fastapi.testclient: For API testing
- SQLAlchemy: For database tests

## Best Practices

1. **Isolation**: Tests should be independent of each other
2. **Coverage**: Aim for high test coverage, especially for critical paths
3. **Speed**: Fast tests help with frequent testing. Avoid unnecessary operations
4. **Clarity**: Clear test names and docstrings make tests easier to maintain
5. **Fixtures**: Reuse test fixtures and setup to reduce duplication 