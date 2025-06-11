"""
Unit Tests for Battery Degradation Model

This module contains unit tests for the BatteryDegradationModel class.
"""
import os
import sys
import unittest
import tempfile
from pathlib import Path
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

# Import the model class to test
from app.ml.models.battery_health.battery_degradation_model import BatteryDegradationModel


class TestBatteryDegradationModel(unittest.TestCase):
    """Test cases for BatteryDegradationModel class"""
    
    def setUp(self):
        """Set up test data"""
        # Create test telemetry data
        np.random.seed(42)  # For reproducible tests
        
        # Generate timestamps for the last 6 months, daily
        timestamps = [datetime.now() - timedelta(days=i) for i in range(180, 0, -1)]
        
        # Base data for one vehicle
        vehicle_data = []
        for i, ts in enumerate(timestamps):
            # Simulate degradation over time - SoH drops from 100% to 95% over 6 months
            degradation_factor = i / len(timestamps) * 5  # 5% degradation over test period
            noise = np.random.normal(0, 0.5)  # Small random noise
            
            # Add a data point
            vehicle_data.append({
                'vehicle_id': 'test_vehicle_1',
                'timestamp': ts,
                'state_of_health': 100 - degradation_factor + noise,  # Decreasing with noise
                'state_of_charge': 70 + np.random.normal(0, 10),  # Random SoC around 70%
                'battery_temp': 25 + np.random.normal(0, 5),  # Random temp around 25°C
                'charge_cycles': i / 3,  # One cycle every 3 days
                'odometer': 10000 + i * 50,  # 50 km per day
                'battery_chemistry': 'NMC',
                'vehicle_type': 'sedan'
            })
        
        # Add a second vehicle with different characteristics
        for i, ts in enumerate(timestamps):
            # Different degradation pattern - drops from 100% to 93%
            degradation_factor = i / len(timestamps) * 7  # 7% degradation over test period
            noise = np.random.normal(0, 0.3)  # Smaller noise
            
            # Add a data point
            vehicle_data.append({
                'vehicle_id': 'test_vehicle_2',
                'timestamp': ts,
                'state_of_health': 100 - degradation_factor + noise,
                'state_of_charge': 60 + np.random.normal(0, 15),  # Different SoC pattern
                'battery_temp': 22 + np.random.normal(0, 3),  # Different temp pattern
                'charge_cycles': i / 2,  # One cycle every 2 days (more frequent)
                'odometer': 15000 + i * 30,  # 30 km per day (less distance)
                'battery_chemistry': 'LFP',
                'vehicle_type': 'suv'
            })
        
        # Convert to DataFrame
        self.test_data = pd.DataFrame(vehicle_data)
        
        # Initialize model
        self.model = BatteryDegradationModel(
            model_type='gradient_boosting',
            chemistry_type=None,  # Generic model for all types
            model_version='test_v1'
        )
    
    def test_initialization(self):
        """Test model initialization"""
        # Test default parameters
        model = BatteryDegradationModel()
        self.assertEqual(model.model_type, 'gradient_boosting')
        self.assertIsNone(model.model)  # Model not trained yet
        
        # Test with custom parameters
        model = BatteryDegradationModel(
            model_type='random_forest',
            chemistry_type='NMC',
            model_version='v2'
        )
        self.assertEqual(model.model_type, 'random_forest')
        self.assertEqual(model.chemistry_type, 'NMC')
        self.assertEqual(model.model_version, 'v2')
    
    def test_preprocess_data(self):
        """Test data preprocessing"""
        # Preprocess the test data
        X, y, feature_names = self.model.preprocess_data(
            telemetry_data=self.test_data,
            target_col='state_of_health'
        )
        
        # Check outputs
        self.assertIsNotNone(X)
        self.assertIsNotNone(y)
        self.assertIsNotNone(feature_names)
        self.assertEqual(len(y), len(self.test_data))
        
        # Check feature engineering
        self.assertGreater(len(feature_names), 0)
    
    def test_train(self):
        """Test model training"""
        # Train the model
        training_results = self.model.train(
            telemetry_data=self.test_data,
            target_col='state_of_health',
            test_size=0.2
        )
        
        # Check if model was trained
        self.assertIsNotNone(self.model.model)
        
        # Check training results
        self.assertIn('model', training_results)
        self.assertIn('metrics', training_results)
        self.assertIn('rmse', training_results['metrics'])
        self.assertIn('r2', training_results['metrics'])
        
        # Check metrics quality (these are just basic sanity checks)
        self.assertLess(training_results['metrics']['rmse'], 5.0)  # RMSE should be reasonable
        self.assertGreater(training_results['metrics']['r2'], 0.5)  # R² should be positive
    
    def test_predict(self):
        """Test prediction on new data"""
        # First train the model
        self.model.train(
            telemetry_data=self.test_data,
            target_col='state_of_health'
        )
        
        # Create some test data for prediction
        test_prediction_data = self.test_data.copy().iloc[:10]
        
        # Make predictions
        predictions = self.model.predict(test_prediction_data)
        
        # Check predictions
        self.assertEqual(len(predictions), len(test_prediction_data))
        
        # Predictions should be in a reasonable range for SoH
        self.assertTrue(all(0 <= pred <= 100 for pred in predictions))
    
    def test_predict_future_health(self):
        """Test prediction of future battery health"""
        # First train the model
        self.model.train(
            telemetry_data=self.test_data,
            target_col='state_of_health'
        )
        
        # Make future predictions
        future_health = self.model.predict_future_health(
            vehicle_id='test_vehicle_1',
            current_telemetry=self.test_data,
            prediction_days=30  # Predict 30 days ahead
        )
        
        # Check future health DataFrame
        self.assertIsNotNone(future_health)
        self.assertEqual(len(future_health), 31)  # 30 days + today
        self.assertIn('timestamp', future_health.columns)
        self.assertIn('predicted_soh', future_health.columns)
        
        # Check that predictions make sense (decreasing or stable over time)
        # Allow for small fluctuations due to model uncertainty
        self.assertLessEqual(
            future_health['predicted_soh'].iloc[-1],
            future_health['predicted_soh'].iloc[0] + 1  # Allow 1% uncertainty
        )
    
    def test_get_replacement_date(self):
        """Test prediction of battery replacement date"""
        # First train the model
        self.model.train(
            telemetry_data=self.test_data,
            target_col='state_of_health'
        )
        
        # Get replacement prediction for both vehicles
        replacement_info_1 = self.model.get_replacement_date(
            vehicle_id='test_vehicle_1',
            current_telemetry=self.test_data,
            soh_threshold=80,  # High threshold to ensure we get a date
            max_prediction_days=3650  # 10 years
        )
        
        replacement_info_2 = self.model.get_replacement_date(
            vehicle_id='test_vehicle_2',
            current_telemetry=self.test_data,
            soh_threshold=80,
            max_prediction_days=3650
        )
        
        # Check that we have replacement info
        self.assertIsNotNone(replacement_info_1)
        self.assertIsNotNone(replacement_info_2)
        
        # Results should be different for the two vehicles
        if replacement_info_1.get('replacement_date') and replacement_info_2.get('replacement_date'):
            self.assertNotEqual(
                replacement_info_1['replacement_date'],
                replacement_info_2['replacement_date']
            )
    
    def test_save_load(self):
        """Test saving and loading the model"""
        # Train the model
        self.model.train(
            telemetry_data=self.test_data,
            target_col='state_of_health'
        )
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix='.joblib', delete=False) as temp_file:
            model_path = temp_file.name
        
        try:
            # Save the model
            self.model.save(model_path)
            
            # Create a new model instance
            loaded_model = BatteryDegradationModel.load(model_path)
            
            # Check if metadata matches
            self.assertEqual(loaded_model.model_type, self.model.model_type)
            self.assertEqual(loaded_model.model_version, self.model.model_version)
            
            # Make predictions with both models
            original_predictions = self.model.predict(self.test_data.iloc[:10])
            loaded_predictions = loaded_model.predict(self.test_data.iloc[:10])
            
            # Predictions should be identical
            np.testing.assert_array_almost_equal(original_predictions, loaded_predictions)
            
        finally:
            # Clean up the temporary file
            if os.path.exists(model_path):
                os.remove(model_path)


if __name__ == '__main__':
    unittest.main() 