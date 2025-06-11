#!/usr/bin/env python3
"""
Fix Battery Model Data Structure

The battery_model_latest.joblib file contains a raw RandomForestRegressor object,
but BatteryDegradationModel.load() expects a dictionary structure.
This script fixes the data structure.
"""

import joblib
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor

def fix_battery_model():
    """Fix the battery model data structure"""
    model_path = 'app/ml/models/battery_health/battery_model_latest.joblib'
    
    try:
        # Load the existing raw model
        print("Loading existing battery model...")
        raw_model = joblib.load(model_path)
        
        # Check if it's already in correct format
        if isinstance(raw_model, dict) and 'model' in raw_model:
            print("✅ Battery model already in correct format")
            return
        
        # Create the expected structure
        print("Wrapping model in expected dictionary structure...")
        model_data = {
            'model': raw_model,
            'metadata': {
                'created_at': datetime.now().isoformat(),
                'model_type': 'random_forest',
                'chemistry_type': None,
                'model_version': 'v1',
                'performance_metrics': {},
                'features': ['state_of_charge', 'battery_temp', 'voltage', 'current', 'charge_cycles'],
                'saved_at': datetime.now().isoformat()
            },
            'feature_importance': getattr(raw_model, 'feature_importances_', None)
        }
        
        # Backup original file
        backup_path = model_path + '.backup'
        os.rename(model_path, backup_path)
        print(f"✅ Created backup: {backup_path}")
        
        # Save in correct format
        joblib.dump(model_data, model_path)
        print(f"✅ Fixed battery model data structure: {model_path}")
        print("✅ Battery model is now compatible with BatteryDegradationModel.load()")
        
    except Exception as e:
        print(f"❌ Error fixing battery model: {str(e)}")
        # Restore backup if it exists
        backup_path = model_path + '.backup'
        if os.path.exists(backup_path):
            os.rename(backup_path, model_path)
            print("🔄 Restored original file from backup")
        raise

if __name__ == '__main__':
    fix_battery_model() 