#!/usr/bin/env python3
"""Test ML import logic"""

import sys
import traceback

print("🔍 Testing ML endpoints import...")

try:
    print("1. Testing XGBoost import...")
    import xgboost as xgb
    print(f"   ✅ XGBoost {xgb.__version__} loaded successfully")
except Exception as e:
    print(f"   ❌ XGBoost failed: {e}")
    traceback.print_exc()

try:
    print("2. Testing matplotlib import...")
    import matplotlib.pyplot as plt
    print("   ✅ Matplotlib loaded successfully")
except Exception as e:
    print(f"   ❌ Matplotlib failed: {e}")
    traceback.print_exc()

try:
    print("3. Testing ML endpoints import...")
    from app.api.ml_endpoints import router
    print("   ✅ ML endpoints loaded successfully")
except Exception as e:
    print(f"   ❌ ML endpoints failed: {e}")
    traceback.print_exc()

print("\n�� Test complete!") 