# Advanced Forecasting Module for EV Charging Infrastructure

This module provides advanced forecasting capabilities for time series data in the EV charging infrastructure.

## Key Components

### Base Forecasting Models

- **ARIMAForecaster**: Auto-regressive Integrated Moving Average models with automatic hyperparameter selection.
- **ExponentialSmoothingForecaster**: Holt-Winters exponential smoothing with trend and seasonal components.
- **LSTMForecaster**: Long Short-Term Memory neural networks for complex time series patterns.

### Advanced Capabilities

- **EnsembleForecaster**: Combines multiple forecasters with weighted averaging based on performance.
- **ModelSelector**: Automatically selects the best forecasting model based on data characteristics.
- **OnlineForecaster**: Extends any forecaster with incremental learning and drift detection.
- **DriftDetector**: Standalone component for detecting concept drift in time series data.

## Usage Examples

### Basic Forecasting

```python
from app.ml.forecasting import ARIMAForecaster

# Create forecaster
arima = ARIMAForecaster(
    name="energy_demand",
    forecast_horizon=24,
    frequency='H',
    auto_order=True
)

# Fit on historical data
arima.fit(data, "energy_demand_kwh")

# Generate forecasts
forecasts = arima.predict(n_periods=48)
```

### Ensemble Forecasting

```python
from app.ml.forecasting import (
    ARIMAForecaster,
    ExponentialSmoothingForecaster,
    LSTMForecaster,
    EnsembleForecaster
)

# Create ensemble
ensemble = EnsembleForecaster(
    name="energy_ensemble",
    forecast_horizon=24,
    frequency='H',
    ensemble_method="weighted"
)

# Add forecasters
ensemble.add_forecaster(ARIMAForecaster(name="arima_component"))
ensemble.add_forecaster(ExponentialSmoothingForecaster(name="expsm_component"))
ensemble.add_forecaster(LSTMForecaster(name="lstm_component"))

# Fit ensemble
ensemble.fit(data, "energy_demand_kwh")

# Generate forecasts
forecasts = ensemble.predict(n_periods=48)
```

### Automatic Model Selection

```python
from app.ml.forecasting import ModelSelector

# Create model selector
selector = ModelSelector(
    models_to_try=['arima', 'expsm', 'lstm', 'ensemble'],
    evaluation_metric='rmse',
    cross_validation=True
)

# Analyze data characteristics
characteristics = selector.analyze_data(data, "energy_demand_kwh")

# Select best model
best_model = selector.select_best_model(
    data=data,
    target_col="energy_demand_kwh",
    forecast_horizon=24,
    frequency='H'
)

# Generate forecasts with best model
forecasts = best_model.predict(n_periods=48)
```

### Online Learning with Drift Detection

```python
from app.ml.forecasting import ARIMAForecaster, OnlineForecaster

# Create base forecaster
base_forecaster = ARIMAForecaster(
    name="energy_online",
    forecast_horizon=24,
    frequency='H'
)

# Wrap with online learning
online_forecaster = OnlineForecaster(
    base_forecaster=base_forecaster,
    update_frequency='D',
    retraining_window=7*24,  # 7 days of hourly data
    drift_detection_method='threshold',
    drift_threshold=0.3
)

# Initial fitting
online_forecaster.fit(historical_data, "energy_demand_kwh")

# Update with new data
update_result = online_forecaster.update(new_data)

# Check if drift was detected
if update_result["drift_detected"]:
    print("Concept drift detected! Model retrained.")

# Generate forecasts
forecasts = online_forecaster.predict(n_periods=48)
```

## Technical Details

### Ensemble Methods

- **Simple Averaging**: Equal weights for all forecasters
- **Weighted Averaging**: Weights based on validation performance
- **Stacked Ensemble**: Meta-learner that learns optimal combination

### Drift Detection Methods

- **Threshold**: Detects drift when performance degrades beyond a threshold
- **Page-Hinkley**: Sequential change detection algorithm
- **ADWIN**: Adaptive Windowing for detecting distribution changes
- **KS-Test**: Kolmogorov-Smirnov test for distribution comparisons

### Online Learning Features

- **Incremental Updates**: Update models with new data efficiently
- **Automatic Retraining**: Retrains when drift is detected
- **Performance Monitoring**: Tracks forecast accuracy over time
- **Scheduled Updates**: Regular updates based on configurable frequency

## Performance Considerations

- **Memory Usage**: Online learning with large historical windows can consume significant memory
- **Computation Time**: LSTM models and ensemble methods are more computationally intensive
- **Storage**: Model versioning and history tracking increase storage requirements

## Integration with Other Modules

- Works seamlessly with the dashboard visualization components
- Integrates with the telemetry ingestion pipeline for real-time updates
- Supports the explainability module for transparent forecasts 