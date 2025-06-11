# GIU EV Charging Infrastructure: Machine Learning Components

This directory contains the machine learning components for the GIU EV Charging Infrastructure project. These components enable advanced analytics, forecasting, and optimization of the EV charging network.

## Overview

The ML system has been enhanced with several advanced capabilities:

- **Time Series Forecasting**: Advanced forecasting for demand, energy prices, and battery health
- **Edge Computing**: Optimized models for resource-constrained charging stations
- **Federated Learning**: Privacy-preserving distributed learning across charging stations
- **Explainable AI**: Transparent decision-making for all models
- **Model Ensemble Framework**: Combining multiple models for improved accuracy
- **Online Learning**: Adaptive models that update with new data and detect pattern changes
- **Multi-Task Learning**: Models that simultaneously predict multiple related metrics

## Key Modules

### Forecasting

The `forecasting` module provides time series forecasting capabilities:

- **Base Models**: ARIMA, Exponential Smoothing, LSTM neural networks
- **Ensemble Framework**: Weighted combination of multiple forecasters
- **Model Selection**: Automatic model selection based on data characteristics
- **Online Learning**: Adapting models to changing patterns with drift detection

### Edge Computing

The `edge` module supports deployment to resource-constrained devices:

- **Model Optimization**: Convert models to run efficiently on edge devices
- **Edge Deployment**: Manage model lifecycle on edge devices

### Federated Learning

The `federated` module enables privacy-preserving distributed learning:

- **Federated Coordinator**: Central server that orchestrates training
- **Federated Client**: Edge device components for local training
- **Differential Privacy**: Protection for sensitive charging data

### Explainability

The `explainability` module provides tools for model transparency:

- **Model Explainer**: SHAP and LIME explanations for model decisions
- **Visualization**: Interactive displays of feature importance
- **Reporting**: Comprehensive explanation reports

### Multi-Task Learning

The `multitask` module supports predicting multiple related metrics:

- **Independent Models**: Separate models for each prediction task
- **Shared Representation**: Neural network with shared layers for multiple tasks
- **Feature Importance Analysis**: Understanding what drives each prediction

## Usage Examples

Each module directory contains detailed documentation and usage examples.

### Forecasting Example

```python
from app.ml.forecasting import ModelSelector

# Create model selector
selector = ModelSelector(
    models_to_try=['arima', 'expsm', 'lstm', 'ensemble'],
    evaluation_metric='rmse',
    cross_validation=True
)

# Select best model for your data
best_model = selector.select_best_model(
    data=charging_data,
    target_col="energy_demand_kwh",
    forecast_horizon=24,
    frequency='H'
)

# Generate forecasts
forecasts = best_model.predict(n_periods=48)
```

### Multi-Task Learning Example

```python
from app.ml.multitask import SharedRepresentationModel

# Create shared representation model
model = SharedRepresentationModel(
    name="charging_station_model",
    tasks=['energy_demand', 'energy_price', 'battery_degradation'],
    shared_layers=[64, 32],
    task_specific_layers=[16]
)

# Fit on historical data
model.fit(
    data=station_data,
    task_columns={
        'energy_demand': 'energy_demand_kwh',
        'energy_price': 'price_per_kwh',
        'battery_degradation': 'degradation_rate'
    },
    feature_columns=[
        'hour', 'day_of_week', 'temperature', 
        'previous_demand', 'is_weekend'
    ]
)

# Generate predictions for multiple targets
predictions = model.predict(new_data)
```

### Online Learning Example

```python
from app.ml.forecasting import ARIMAForecaster, OnlineForecaster

# Create base forecaster
forecaster = ARIMAForecaster(
    name="demand_forecaster",
    forecast_horizon=24,
    frequency='H'
)

# Wrap with online learning
online_forecaster = OnlineForecaster(
    base_forecaster=forecaster,
    update_frequency='D',
    drift_detection_method='threshold'
)

# Initial fitting
online_forecaster.fit(historical_data, "energy_demand_kwh")

# Update with new data (e.g., in a daily scheduled job)
update_results = online_forecaster.update(new_data)

# Check if drift was detected
if update_results["drift_detected"]:
    print("Pattern change detected! Model automatically retrained.")
```

## Example Scripts

The `examples` directory contains demonstration scripts for each capability:

- `advanced_forecasting_example.py`: Demonstrates ensemble forecasting and online learning
- `multitask_learning_example.py`: Shows how to predict multiple related metrics simultaneously
- `edge_deployment_example.py`: Example of optimizing and deploying models to edge devices
- `federated_learning_example.py`: Demonstrates privacy-preserving distributed learning

## Performance Monitoring

All models are integrated with the monitoring system, providing:

- Performance metrics tracking over time
- Drift detection alerts
- Model versioning and history

## Requirements

The ML components require various Python packages. See `requirements-ml.txt` for the full list of dependencies 