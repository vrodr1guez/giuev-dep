#!/usr/bin/env python3
"""
Test runner script for running the service unit tests.

Usage:
    python -m tests.run_tests

or directly:
    ./tests/run_tests.py
"""

import unittest
import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


def discover_and_run_tests():
    """Discover and run all tests in the tests directory."""
    print("=" * 80)
    print("EV Charging Infrastructure Test Suite")
    print("=" * 80)
    print("\nDiscovering tests...")
    
    # Create test loader
    loader = unittest.TestLoader()
    
    # Discover all tests in the tests directory
    tests_dir = os.path.dirname(os.path.abspath(__file__))
    test_suite = loader.discover(tests_dir, pattern="test_*.py")
    
    print(f"Found tests in: {tests_dir}")
    
    # Count tests
    test_count = test_suite.countTestCases()
    print(f"Total test cases: {test_count}")
    
    # Run tests
    print("\nRunning tests...\n")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 80)
    print("Test Summary:")
    print("-" * 80)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")
    print("=" * 80)
    
    # Return appropriate exit code
    if result.failures or result.errors:
        return 1
    return 0


def run_specific_test_module(module_path):
    """Run tests from a specific module."""
    print(f"Running tests from: {module_path}")
    
    # Create test loader
    loader = unittest.TestLoader()
    
    # Extract the module name from the path
    if module_path.endswith('.py'):
        module_path = module_path[:-3]
    module_path = module_path.replace('/', '.')
    
    try:
        suite = loader.loadTestsFromName(module_path)
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        return 0 if result.wasSuccessful() else 1
    except (ImportError, AttributeError) as e:
        print(f"Error loading module {module_path}: {e}")
        return 1


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # If a module path is specified, run only that module
        module_path = sys.argv[1]
        exit_code = run_specific_test_module(module_path)
    else:
        # Otherwise, discover and run all tests
        exit_code = discover_and_run_tests()
    
    sys.exit(exit_code) 