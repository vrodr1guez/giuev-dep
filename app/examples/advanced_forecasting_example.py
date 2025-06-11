"""
Advanced Forecasting Example

This script demonstrates the advanced forecasting capabilities including:
- Ensemble forecasting
- Model selection based on data characteristics
- Online learning with drift detection
"""
import os
import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from datetime import datetime, timedelta

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.ml.forecasting import (
    ARIMAForecaster,
    ExponentialSmoothingForecaster,
    LSTMForecaster,
    EnsembleForecaster,
    ModelSelector,
    OnlineForecaster
)

def generate_sample_data(start_date: str, end_date: str, freq: str = 'H') -> pd.DataFrame:
    """
    Generate sample time series data with patterns
    
    Args:
        start_date: Start date for data generation
        end_date: End date for data generation
        freq: Frequency of data ('H' for hourly, 'D' for daily)
        
    Returns:
        DataFrame with time series data
    """
    # Create date range
    date_rng = pd.date_range(start=start_date, end=end_date, freq=freq)
    
    # Create patterns
    hourly_pattern = np.sin(np.linspace(0, 2*np.pi, 24)) * 10 + 30
    daily_pattern = np.sin(np.linspace(0, 2*np.pi, 7)) * 5 + 10
    
    data = []
    for i, date in enumerate(date_rng):
        # Base value with hourly pattern
        if freq == 'H':
            value = hourly_pattern[date.hour]
            # Add daily pattern
            value += daily_pattern[date.dayofweek]
        else:
            value = daily_pattern[date.dayofweek]
        
        # Add trend
        value += i * 0.01
        
        # Add noise
        value += np.random.normal(0, 3)
        
        # Create features
        features = {
            "timestamp": date,
            "value": value,
            "hour": date.hour,
            "day": date.dayofweek,
            "month": date.month,
            "is_weekend": 1 if date.dayofweek >= 5 else 0,
            "temperature": 25 + 5 * np.sin(np.pi * i / (24 if freq == 'H' else 1) / 30) + np.random.normal(0, 2)
        }
        
        data.append(features)
    
    df = pd.DataFrame(data)
    df.set_index("timestamp", inplace=True)
    
    return df

def generate_drift_data(original_data: pd.DataFrame, days: int = 5, freq: str = 'H', 
                        shift: int = 6, trend_factor: float = 0.05) -> pd.DataFrame:
    """
    Generate data with drift from original patterns
    
    Args:
        original_data: Original data
        days: Number of days to generate
        freq: Frequency of data
        shift: Shift in hours to introduce pattern drift
        trend_factor: Factor to increase trend
        
    Returns:
        DataFrame with drift data
    """
    last_date = original_data.index[-1]
    start_date = last_date + pd.Timedelta(1, unit=freq)
    end_date = start_date + pd.Timedelta(days, unit='D') if freq == 'H' else start_date + pd.Timedelta(days*24, unit='H')
    
    # Create date range
    date_rng = pd.date_range(start=start_date, end=end_date, freq=freq)
    
    # Extract patterns from original data to ensure continuity
    hourly_values = original_data.groupby(original_data.index.hour)['value'].mean()
    hourly_pattern = hourly_values.values
    
    daily_values = original_data.groupby(original_data.index.dayofweek)['value'].mean()
    daily_pattern = daily_values.values
    
    data = []
    for i, date in enumerate(date_rng):
        # Base value with shifted hourly pattern
        if freq == 'H':
            value = hourly_pattern[(date.hour + shift) % 24]
            # Add daily pattern
            value += daily_pattern[date.dayofweek]
        else:
            value = daily_pattern[(date.dayofweek + 2) % 7]  # Shift day of week pattern
        
        # Add stronger trend
        value += i * trend_factor
        
        # Add more noise
        value += np.random.normal(0, 5)
        
        # Create features
        features = {
            "timestamp": date,
            "value": value,
            "hour": date.hour,
            "day": date.dayofweek,
            "month": date.month,
            "is_weekend": 1 if date.dayofweek >= 5 else 0,
            "temperature": 30 + 8 * np.sin(np.pi * i / (24 if freq == 'H' else 1) / 15) + np.random.normal(0, 3)
        }
        
        data.append(features)
    
    df = pd.DataFrame(data)
    df.set_index("timestamp", inplace=True)
    
    return df

def demonstrate_ensemble() -> None:
    """Demonstrate ensemble forecasting capabilities"""
    print("=" * 50)
    print("ENSEMBLE FORECASTING DEMONSTRATION")
    print("=" * 50)
    
    # Generate data
    print("Generating sample data...")
    data = generate_sample_data(start_date='2023-01-01', end_date='2023-01-31', freq='H')
    print(f"Generated {len(data)} data points")
    
    # Split into train/test
    train_size = int(len(data) * 0.8)
    train_data = data.iloc[:train_size]
    test_data = data.iloc[train_size:]
    
    print(f"Training data: {len(train_data)} points")
    print(f"Testing data: {len(test_data)} points")
    
    # Create individual forecasters
    print("\nCreating individual forecasters...")
    arima = ARIMAForecaster(
        name="arima",
        forecast_horizon=24,
        frequency='H',
        auto_order=True
    )
    
    expsm = ExponentialSmoothingForecaster(
        name="expsm",
        forecast_horizon=24,
        frequency='H',
        trend='add',
        seasonal='add',
        seasonal_periods=24
    )
    
    try:
        import tensorflow as tf
        tf_available = True
        lstm = LSTMForecaster(
            name="lstm",
            forecast_horizon=24,
            frequency='H',
            sequence_length=48,
            hidden_units=[64, 32],
            epochs=10  # Low for demonstration
        )
    except ImportError:
        tf_available = False
        print("TensorFlow not available. LSTM forecaster will not be used.")
    
    # Create ensemble
    print("Creating ensemble forecaster...")
    ensemble = EnsembleForecaster(
        name="ensemble",
        forecast_horizon=24,
        frequency='H',
        ensemble_method="weighted"
    )
    
    # Add forecasters to ensemble
    ensemble.add_forecaster(arima)
    ensemble.add_forecaster(expsm)
    if tf_available:
        ensemble.add_forecaster(lstm)
    
    # Fit individual forecasters and ensemble
    print("Fitting ARIMA forecaster...")
    arima.fit(train_data, "value")
    
    print("Fitting Exponential Smoothing forecaster...")
    expsm.fit(train_data, "value")
    
    if tf_available:
        print("Fitting LSTM forecaster...")
        lstm.fit(train_data, "value")
    
    print("Fitting ensemble forecaster...")
    ensemble.fit(train_data, "value")
    
    # Generate forecasts
    print("\nGenerating forecasts...")
    arima_forecast = arima.predict(
        start_date=test_data.index[0],
        n_periods=len(test_data)
    )
    
    expsm_forecast = expsm.predict(
        start_date=test_data.index[0],
        n_periods=len(test_data)
    )
    
    if tf_available:
        lstm_forecast = lstm.predict(
            start_date=test_data.index[0],
            n_periods=len(test_data)
        )
    
    ensemble_forecast = ensemble.predict(
        start_date=test_data.index[0],
        n_periods=len(test_data)
    )
    
    # Calculate metrics
    arima_rmse = np.sqrt(np.mean((test_data['value'].values - arima_forecast['forecast'].values) ** 2))
    expsm_rmse = np.sqrt(np.mean((test_data['value'].values - expsm_forecast['forecast'].values) ** 2))
    if tf_available:
        lstm_rmse = np.sqrt(np.mean((test_data['value'].values - lstm_forecast['forecast'].values) ** 2))
    ensemble_rmse = np.sqrt(np.mean((test_data['value'].values - ensemble_forecast['forecast'].values) ** 2))
    
    print("\nForecast Performance (RMSE):")
    print(f"ARIMA: {arima_rmse:.4f}")
    print(f"Exponential Smoothing: {expsm_rmse:.4f}")
    if tf_available:
        print(f"LSTM: {lstm_rmse:.4f}")
    print(f"Ensemble: {ensemble_rmse:.4f}")
    
    # Get ensemble weights
    weights = ensemble.weights
    print("\nEnsemble Weights:")
    for i, forecaster in enumerate(ensemble.forecasters):
        print(f"{forecaster.__class__.__name__}: {weights[i]:.4f}")
    
    # Plot forecasts
    plt.figure(figsize=(12, 6))
    plt.plot(test_data.index, test_data['value'], label='Actual', color='black')
    plt.plot(arima_forecast.index, arima_forecast['forecast'], label='ARIMA', linestyle='--')
    plt.plot(expsm_forecast.index, expsm_forecast['forecast'], label='ExpSm', linestyle='--')
    if tf_available:
        plt.plot(lstm_forecast.index, lstm_forecast['forecast'], label='LSTM', linestyle='--')
    plt.plot(ensemble_forecast.index, ensemble_forecast['forecast'], label='Ensemble', linewidth=2)
    
    plt.title('Forecast Comparison')
    plt.xlabel('Date')
    plt.ylabel('Value')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    # Save plot
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    plt.savefig(output_dir / 'ensemble_comparison.png')
    print(f"\nPlot saved to {output_dir / 'ensemble_comparison.png'}")
    plt.close()

def demonstrate_model_selector() -> None:
    """Demonstrate automatic model selection based on data characteristics"""
    print("\n" + "=" * 50)
    print("MODEL SELECTOR DEMONSTRATION")
    print("=" * 50)
    
    # Generate two datasets with different characteristics
    print("Generating datasets with different characteristics...")
    
    # Dataset 1: Strong seasonality
    data1 = generate_sample_data(start_date='2023-01-01', end_date='2023-02-15', freq='H')
    
    # Dataset 2: Less seasonal, more trend and noise
    date_rng = pd.date_range(start='2023-01-01', end='2023-02-15', freq='H')
    
    data = []
    for i, date in enumerate(date_rng):
        # Weak seasonality
        value = np.sin(np.linspace(0, 2*np.pi, 24))[date.hour] * 3
        
        # Strong trend
        value += i * 0.05
        
        # More noise
        value += np.random.normal(0, 5)
        
        data.append({"timestamp": date, "value": value})
    
    data2 = pd.DataFrame(data)
    data2.set_index("timestamp", inplace=True)
    
    # Split datasets for evaluation
    train_size1 = int(len(data1) * 0.8)
    train_data1 = data1.iloc[:train_size1]
    test_data1 = data1.iloc[train_size1:]
    
    train_size2 = int(len(data2) * 0.8)
    train_data2 = data2.iloc[:train_size2]
    test_data2 = data2.iloc[train_size2:]
    
    # Create model selector
    selector = ModelSelector(
        models_to_try=['arima', 'expsm', 'ensemble'],
        evaluation_metric='rmse',
        cross_validation=True,
        cv_folds=3
    )
    
    # Dataset 1
    print("\nAnalyzing Dataset 1 (Strong Seasonality)...")
    characteristics1 = selector.analyze_data(train_data1, "value")
    print("Dataset 1 Characteristics:")
    for key, value in characteristics1.items():
        print(f"  {key}: {value}")
    
    print("\nSelecting best model for Dataset 1...")
    best_model1 = selector.select_best_model(
        data=train_data1,
        target_col="value",
        forecast_horizon=24,
        frequency='H'
    )
    
    print(f"\nBest model for Dataset 1: {best_model1.__class__.__name__}")
    print("Model Performances:")
    for model_name, score in selector.model_performances.items():
        print(f"  {model_name}: {score:.4f}")
    
    # Dataset 2
    print("\nAnalyzing Dataset 2 (Strong Trend, More Noise)...")
    characteristics2 = selector.analyze_data(train_data2, "value")
    print("Dataset 2 Characteristics:")
    for key, value in characteristics2.items():
        print(f"  {key}: {value}")
    
    print("\nSelecting best model for Dataset 2...")
    best_model2 = selector.select_best_model(
        data=train_data2,
        target_col="value",
        forecast_horizon=24,
        frequency='H'
    )
    
    print(f"\nBest model for Dataset 2: {best_model2.__class__.__name__}")
    print("Model Performances:")
    for model_name, score in selector.model_performances.items():
        print(f"  {model_name}: {score:.4f}")
    
    # Generate forecasts with best models
    forecast1 = best_model1.predict(
        start_date=test_data1.index[0],
        n_periods=len(test_data1)
    )
    
    forecast2 = best_model2.predict(
        start_date=test_data2.index[0],
        n_periods=len(test_data2)
    )
    
    # Plot results
    fig, axes = plt.subplots(2, 1, figsize=(12, 10))
    
    # Dataset 1
    axes[0].plot(test_data1.index, test_data1['value'], label='Actual', color='black')
    axes[0].plot(forecast1.index, forecast1['forecast'], label=f'Forecast ({best_model1.__class__.__name__})', color='red')
    axes[0].set_title('Dataset 1: Strong Seasonality')
    axes[0].set_xlabel('Date')
    axes[0].set_ylabel('Value')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # Dataset 2
    axes[1].plot(test_data2.index, test_data2['value'], label='Actual', color='black')
    axes[1].plot(forecast2.index, forecast2['forecast'], label=f'Forecast ({best_model2.__class__.__name__})', color='blue')
    axes[1].set_title('Dataset 2: Strong Trend, More Noise')
    axes[1].set_xlabel('Date')
    axes[1].set_ylabel('Value')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save plot
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    plt.savefig(output_dir / 'model_selector_comparison.png')
    print(f"\nPlot saved to {output_dir / 'model_selector_comparison.png'}")
    plt.close()

def demonstrate_online_learning() -> None:
    """Demonstrate online learning with drift detection"""
    print("\n" + "=" * 50)
    print("ONLINE LEARNING DEMONSTRATION")
    print("=" * 50)
    
    # Generate initial data
    print("Generating initial data...")
    initial_data = generate_sample_data(start_date='2023-01-01', end_date='2023-01-15', freq='H')
    
    # Generate drift data
    print("Generating data with concept drift...")
    drift_data = generate_drift_data(
        original_data=initial_data,
        days=10,
        freq='H',
        shift=6,  # 6-hour shift in pattern
        trend_factor=0.05  # Stronger trend
    )
    
    print(f"Initial data: {len(initial_data)} points")
    print(f"Drift data: {len(drift_data)} points")
    
    # Create base forecaster
    base_forecaster = ARIMAForecaster(
        name="arima_online",
        forecast_horizon=24,
        frequency='H',
        auto_order=True
    )
    
    # Wrap with online learning
    print("\nCreating online forecaster with drift detection...")
    online_forecaster = OnlineForecaster(
        base_forecaster=base_forecaster,
        update_frequency='D',  # Daily updates
        retraining_window=5*24,  # 5 days of hourly data
        drift_detection_method='threshold',
        drift_threshold=0.3,
        performance_metric='rmse'
    )
    
    # Fit on initial data
    print("Fitting online forecaster on initial data...")
    online_forecaster.fit(initial_data, "value")
    
    # Process drift data day by day
    print("\nProcessing new data with potential drift...")
    # Split drift data into daily chunks
    daily_chunks = [group for _, group in drift_data.groupby(drift_data.index.date)]
    
    all_updates = []
    for i, chunk in enumerate(daily_chunks):
        print(f"Day {i+1}: Processing {len(chunk)} new data points...")
        
        # Update model with new data
        update_result = online_forecaster.update(chunk)
        
        # Store results
        all_updates.append({
            "day": i+1,
            "data_points": len(chunk),
            "performance": update_result.get("performance"),
            "drift_detected": update_result.get("drift_detected", False),
            "retrained": update_result.get("retrained", False),
            "updated": update_result.get("updated", False)
        })
        
        # Report if drift was detected
        if update_result.get("drift_detected", False):
            print(f"  ⚠️ Drift detected on day {i+1}! Model retrained.")
        elif update_result.get("updated", False):
            print(f"  ℹ️ Regular update performed on day {i+1}.")
    
    # Create summary
    print("\nOnline Learning Summary:")
    print(f"Total days processed: {len(daily_chunks)}")
    print(f"Drift events detected: {sum(1 for u in all_updates if u['drift_detected'])}")
    print(f"Regular updates performed: {sum(1 for u in all_updates if u['updated'] and not u['drift_detected'])}")
    
    # Get performance history
    perf_history = online_forecaster.get_performance_history()
    print(f"\nPerformance history contains {len(perf_history)} entries")
    
    # Get drift events
    drift_events = online_forecaster.get_drift_events()
    print(f"Drift events: {len(drift_events)}")
    
    # Plot performance history
    plt.figure(figsize=(12, 6))
    plt.plot(
        range(len(perf_history)),
        perf_history['value'], 
        marker='o', 
        linestyle='-',
        label='RMSE'
    )
    
    # Add drift events
    for day in [u['day'] for u in all_updates if u['drift_detected']]:
        plt.axvline(x=day-1, color='r', linestyle='--', alpha=0.7)
    
    plt.title('Online Forecaster Performance with Drift Detection')
    plt.xlabel('Days')
    plt.ylabel('RMSE')
    plt.axvline(x=0, color='r', linestyle='--', alpha=0.7, label='Drift Detected')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # Save plot
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    plt.savefig(output_dir / 'online_learning_performance.png')
    print(f"\nPlot saved to {output_dir / 'online_learning_performance.png'}")
    plt.close()

def main():
    """Main function to run all demonstrations"""
    # Create output directory
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    # Run demonstrations
    demonstrate_ensemble()
    demonstrate_model_selector()
    demonstrate_online_learning()
    
    print("\nAll demonstrations completed. Results saved to the 'output' directory.")

if __name__ == "__main__":
    main() 