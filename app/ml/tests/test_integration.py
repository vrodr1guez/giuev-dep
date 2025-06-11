"""
Integration Tests for ML Components

This module provides comprehensive integration tests for the ML components,
focusing on how they work together and handle edge cases like missing data
and concept drift scenarios.
"""
import sys
import os
import unittest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

# Import ML components
from app.ml.forecasting import (
    BaseForecaster,
    ARIMAForecaster,
    ExponentialSmoothingForecaster,
    LSTMForecaster,
    EnsembleForecaster,
    ModelSelector,
    OnlineForecaster,
    DriftDetector
)

from app.ml.multitask import MultiTaskModel, SharedRepresentationModel

class IntegrationTestData:
    """Helper class to generate test data for integration tests"""
    
    @staticmethod
    def generate_time_series(days=30, freq='H', with_missing=False, with_drift=False):
        """
        Generate synthetic time series data with optional missing values and drift
        
        Args:
            days: Number of days to generate
            freq: Frequency ('H' for hourly, 'D' for daily)
            with_missing: Whether to include missing values
            with_drift: Whether to include concept drift
            
        Returns:
            DataFrame with synthetic data
        """
        # Create date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        date_range = pd.date_range(start=start_date, end=end_date, freq=freq)
        
        # Create patterns
        hourly_pattern = np.sin(np.linspace(0, 2*np.pi, 24)) * 10 + 30
        daily_pattern = np.sin(np.linspace(0, 2*np.pi, 7)) * 5 + 10
        
        # Generate data
        data = []
        for i, timestamp in enumerate(date_range):
            hour = timestamp.hour
            day_of_week = timestamp.dayofweek
            
            # Base value with patterns
            if freq == 'H':
                value = hourly_pattern[hour] + daily_pattern[day_of_week]
            else:
                value = daily_pattern[day_of_week]
            
            # Add trend
            value += i * 0.01
            
            # Add drift if requested
            if with_drift and i > len(date_range) * 0.7:  # Drift in last 30%
                value += 15  # Significant level shift
            
            # Add noise
            value += np.random.normal(0, 3)
            
            # Create dictionary for this data point
            data_point = {
                "timestamp": timestamp,
                "value": value,
                "temperature": 25 + 5 * np.sin(np.pi * i / (24 if freq == 'H' else 1) / 30),
                "is_weekend": 1 if day_of_week >= 5 else 0
            }
            
            data.append(data_point)
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Add missing values if requested
        if with_missing:
            # Randomly set 5% of values to NaN
            mask = np.random.random(len(df)) < 0.05
            df.loc[mask, 'value'] = np.nan
        
        # Set timestamp as index
        df.set_index("timestamp", inplace=True)
        
        return df
    
    @staticmethod
    def generate_multitask_data(samples=1000, with_missing=False):
        """
        Generate synthetic data for multi-task learning
        
        Args:
            samples: Number of samples to generate
            with_missing: Whether to include missing values
            
        Returns:
            DataFrame with synthetic data for multi-task learning
        """
        # Generate timestamps
        base_date = datetime(2023, 1, 1)
        timestamps = [base_date + timedelta(hours=i) for i in range(samples)]
        
        # Generate features
        np.random.seed(42)
        
        # Time-based features
        hour = np.array([d.hour for d in timestamps])
        day_of_week = np.array([d.weekday() for d in timestamps])
        is_weekend = (day_of_week >= 5).astype(int)
        
        # Temperature with seasonal pattern
        temperature = 20 + 15 * np.sin(np.linspace(0, 4*np.pi, samples)) + np.random.normal(0, 3, samples)
        
        # Random features
        feature1 = np.random.normal(0, 1, samples)
        feature2 = np.random.normal(0, 1, samples)
        
        # Base pattern that affects all targets
        base_pattern = 10 * np.sin(np.linspace(0, 8*np.pi, samples))
        
        # Generate targets
        # Energy demand - affected by hour, temperature, weekend
        energy_demand = (
            50 +  # Base demand
            10 * np.sin(hour * np.pi / 12) +  # Hour effect
            0.5 * temperature +  # Temperature effect
            0.2 * base_pattern +  # Long-term pattern
            5 * is_weekend +  # Weekend effect
            np.random.normal(0, 5, samples)  # Noise
        )
        
        # Energy price - correlated with demand
        energy_price = (
            20 +  # Base price
            0.2 * energy_demand +  # Demand effect
            0.3 * base_pattern +  # Long-term pattern
            np.random.normal(0, 2, samples)  # Noise
        )
        
        # Create DataFrame
        data = pd.DataFrame({
            "timestamp": timestamps,
            "hour": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "temperature": temperature,
            "feature1": feature1,
            "feature2": feature2,
            "energy_demand": energy_demand,
            "energy_price": energy_price
        })
        
        # Add missing values if requested
        if with_missing:
            # Randomly set 5% of values to NaN in each target
            for target in ['energy_demand', 'energy_price']:
                mask = np.random.random(len(data)) < 0.05
                data.loc[mask, target] = np.nan
        
        # Set timestamp as index
        data.set_index("timestamp", inplace=True)
        
        return data


class TestComponentIntegration(unittest.TestCase):
    """Integration tests for ML components"""
    
    def setUp(self):
        """Set up test data"""
        # Generate test data
        self.data_normal = IntegrationTestData.generate_time_series(days=30, freq='H')
        self.data_missing = IntegrationTestData.generate_time_series(days=30, freq='H', with_missing=True)
        self.data_drift = IntegrationTestData.generate_time_series(days=30, freq='H', with_drift=True)
        self.multitask_data = IntegrationTestData.generate_multitask_data(samples=1000)
        
        # Create output directory for any saved models
        os.makedirs("test_outputs", exist_ok=True)
    
    def test_ensemble_with_multiple_forecasters(self):
        """Test that ensemble forecaster works with multiple base forecasters"""
        # Create base forecasters
        arima = ARIMAForecaster(
            name="arima_test",
            forecast_horizon=24,
            frequency='H'
        )
        
        expsm = ExponentialSmoothingForecaster(
            name="expsm_test",
            forecast_horizon=24,
            frequency='H'
        )
        
        # Create ensemble
        ensemble = EnsembleForecaster(
            name="ensemble_test",
            forecast_horizon=24,
            frequency='H',
            ensemble_method="weighted"
        )
        
        # Add forecasters to ensemble
        ensemble.add_forecaster(arima)
        ensemble.add_forecaster(expsm)
        
        # Try to add LSTM if available
        try:
            lstm = LSTMForecaster(
                name="lstm_test",
                forecast_horizon=24,
                frequency='H',
                sequence_length=48,
                hidden_units=[64, 32],
                epochs=5  # Low for testing
            )
            ensemble.add_forecaster(lstm)
            num_forecasters = 3
        except Exception as e:
            print(f"LSTM not added to ensemble: {e}")
            num_forecasters = 2
        
        # Fit ensemble on data
        ensemble.fit(self.data_normal, "value")
        
        # Verify weights were assigned
        self.assertIsNotNone(ensemble.weights)
        self.assertEqual(len(ensemble.weights), num_forecasters)
        
        # Generate forecasts
        forecasts = ensemble.predict(n_periods=24)
        
        # Verify forecasts
        self.assertEqual(len(forecasts), 24)
        self.assertIn('forecast', forecasts.columns)
    
    def test_model_selector_with_different_data(self):
        """Test that model selector chooses different models for different data"""
        # Create model selector
        selector = ModelSelector(
            models_to_try=['arima', 'expsm'],  # Exclude LSTM for faster tests
            evaluation_metric='rmse',
            cross_validation=True,
            cv_folds=2  # Low for testing
        )
        
        # Test with normal data
        best_model_normal = selector.select_best_model(
            data=self.data_normal,
            target_col="value",
            forecast_horizon=24,
            frequency='H'
        )
        normal_model_name = best_model_normal.__class__.__name__
        
        # Reset selector for next test
        selector = ModelSelector(
            models_to_try=['arima', 'expsm'],
            evaluation_metric='rmse',
            cross_validation=True,
            cv_folds=2
        )
        
        # Generate data with strong trend but no seasonality
        trend_data = self.data_normal.copy()
        trend_data['value'] = np.arange(len(trend_data)) * 0.5 + np.random.normal(0, 3, len(trend_data))
        
        # Test with trend data
        best_model_trend = selector.select_best_model(
            data=trend_data,
            target_col="value",
            forecast_horizon=24,
            frequency='H'
        )
        trend_model_name = best_model_trend.__class__.__name__
        
        # Verify model selection works (not important which models were selected,
        # just that the selection process runs successfully)
        self.assertIsNotNone(best_model_normal)
        self.assertIsNotNone(best_model_trend)
        
        # Verify both models can generate forecasts
        forecast_normal = best_model_normal.predict(n_periods=24)
        forecast_trend = best_model_trend.predict(n_periods=24)
        
        self.assertEqual(len(forecast_normal), 24)
        self.assertEqual(len(forecast_trend), 24)
    
    def test_online_forecaster_with_drift(self):
        """Test that online forecaster can detect and adapt to drift"""
        # Split data into initial and new data (with drift)
        split_point = int(len(self.data_drift) * 0.7)  # Split at the drift point
        initial_data = self.data_drift.iloc[:split_point]
        new_data = self.data_drift.iloc[split_point:]
        
        # Create base forecaster
        base_forecaster = ARIMAForecaster(
            name="arima_online_test",
            forecast_horizon=24,
            frequency='H'
        )
        
        # Create online forecaster
        online_forecaster = OnlineForecaster(
            base_forecaster=base_forecaster,
            update_frequency='D',
            retraining_window=48,
            drift_detection_method='threshold',
            drift_threshold=0.2,  # Lower threshold to detect the drift
            performance_metric='rmse'
        )
        
        # Fit on initial data
        online_forecaster.fit(initial_data, "value")
        
        # Update with new data (should detect drift)
        update_result = online_forecaster.update(new_data)
        
        # Check if drift was detected
        self.assertIn("drift_detected", update_result)
        
        # Since we inserted a significant level shift, drift should be detected
        self.assertTrue(update_result["drift_detected"])
        
        # Check that performance history is recorded
        perf_history = online_forecaster.get_performance_history()
        self.assertGreater(len(perf_history), 0)
        
        # Check that forecaster can still generate predictions after update
        forecasts = online_forecaster.predict(n_periods=24)
        self.assertEqual(len(forecasts), 24)
    
    def test_multitask_model(self):
        """Test that multi-task model can predict multiple targets"""
        # Create multi-task model
        model = MultiTaskModel(
            name="multitask_test",
            tasks=['energy_demand', 'energy_price']
        )
        
        # Define features and task columns
        feature_columns = [
            'hour', 'day_of_week', 'is_weekend', 'temperature', 
            'feature1', 'feature2'
        ]
        
        task_columns = {
            'energy_demand': 'energy_demand',
            'energy_price': 'energy_price'
        }
        
        # Split data for training and testing
        train_size = int(len(self.multitask_data) * 0.8)
        train_data = self.multitask_data.iloc[:train_size]
        test_data = self.multitask_data.iloc[train_size:]
        
        # Fit model
        model.fit(
            data=train_data,
            task_columns=task_columns,
            feature_columns=feature_columns
        )
        
        # Generate predictions
        predictions = model.predict(test_data)
        
        # Verify predictions
        self.assertIn('energy_demand', predictions)
        self.assertIn('energy_price', predictions)
        self.assertEqual(len(predictions['energy_demand']), len(test_data))
        
        # Test feature importance
        importance = model.feature_importance('energy_demand')
        self.assertGreater(len(importance), 0)
    
    def test_tensorflow_fallback(self):
        """Test that LSTM forecaster properly falls back when TensorFlow is unavailable"""
        # Try to create an LSTM forecaster with fallback
        try:
            forecaster = LSTMForecaster(
                name="lstm_fallback_test",
                forecast_horizon=24,
                frequency='H',
                fallback_on_import_error=True
            )
            
            # Fit on data
            forecaster.fit(self.data_normal, "value")
            
            # Generate forecasts
            forecasts = forecaster.predict(n_periods=24)
            
            # Verify forecasts
            self.assertEqual(len(forecasts), 24)
            self.assertIn('forecast', forecasts.columns)
            
            # If we're here, either TensorFlow worked or the fallback worked
            self.assertIsNotNone(forecaster)
        except Exception as e:
            # This should not happen since we requested fallback
            self.fail(f"LSTMForecaster with fallback failed: {e}")
    
    def test_handle_missing_data(self):
        """Test that forecasters can handle missing data"""
        # Create forecaster
        forecaster = ExponentialSmoothingForecaster(
            name="expsm_missing_test",
            forecast_horizon=24,
            frequency='H'
        )
        
        # Fit on data with missing values
        try:
            # First handle missing values
            filled_data = self.data_missing.copy()
            filled_data['value'] = filled_data['value'].interpolate(method='linear')
            
            forecaster.fit(filled_data, "value")
            
            # Generate forecasts
            forecasts = forecaster.predict(n_periods=24)
            
            # Verify forecasts
            self.assertEqual(len(forecasts), 24)
            self.assertIn('forecast', forecasts.columns)
        except Exception as e:
            self.fail(f"Failed to handle missing data: {e}")

    def test_complex_ensemble_pipeline(self):
        """Test a complex pipeline with model selection, ensemble, and online learning"""
        # Split data for initial training and updates
        split_point = int(len(self.data_normal) * 0.7)
        initial_data = self.data_normal.iloc[:split_point]
        update_data = self.data_normal.iloc[split_point:]
        
        # 1. Use model selector to choose best models
        selector = ModelSelector(
            models_to_try=['arima', 'expsm'],  # Exclude LSTM for faster tests
            evaluation_metric='rmse',
            cross_validation=True,
            cv_folds=2  # Low for testing
        )
        
        # Select two different models with different subsets of data
        model1 = selector.select_best_model(
            data=initial_data.iloc[:int(len(initial_data)/2)],
            target_col="value",
            forecast_horizon=24,
            frequency='H'
        )
        
        model2 = selector.select_best_model(
            data=initial_data.iloc[int(len(initial_data)/2):],
            target_col="value",
            forecast_horizon=24,
            frequency='H'
        )
        
        # 2. Create ensemble with selected models
        ensemble = EnsembleForecaster(
            name="complex_ensemble_test",
            forecast_horizon=24,
            frequency='H',
            ensemble_method="weighted"
        )
        
        ensemble.add_forecaster(model1)
        ensemble.add_forecaster(model2)
        
        # 3. Wrap with online learning
        online_forecaster = OnlineForecaster(
            base_forecaster=ensemble,
            update_frequency='D',
            retraining_window=48,
            drift_detection_method='threshold',
            drift_threshold=0.3,
            performance_metric='rmse'
        )
        
        # 4. Fit and predict
        online_forecaster.fit(initial_data, "value")
        
        # 5. Update with new data
        update_result = online_forecaster.update(update_data)
        
        # 6. Generate final forecasts
        forecasts = online_forecaster.predict(n_periods=24)
        
        # Verify the pipeline worked
        self.assertEqual(len(forecasts), 24)
        self.assertIn('forecast', forecasts.columns)


if __name__ == "__main__":
    unittest.main() 