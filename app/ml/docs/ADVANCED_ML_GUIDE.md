# Advanced ML Capabilities Guide

This guide provides detailed documentation on using the advanced machine learning capabilities in the GIU EV Charging Infrastructure.

## Table of Contents

1. [Introduction](#introduction)
2. [Ensemble Forecasting](#ensemble-forecasting)
3. [Model Selection](#model-selection)
4. [Online Learning](#online-learning)
5. [Multi-Task Learning](#multi-task-learning)
6. [Dashboard Integration](#dashboard-integration)
7. [API Reference](#api-reference)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting](#troubleshooting)

## Introduction

The GIU EV Charging Infrastructure's ML system has been enhanced with several advanced capabilities:

- **Ensemble Forecasting**: Combine multiple models for better prediction accuracy
- **Model Selection**: Automatically choose the best model based on data characteristics
- **Online Learning**: Continuously update models with new data and detect pattern changes
- **Multi-Task Learning**: Predict multiple related metrics simultaneously

These capabilities provide significant improvements in forecasting accuracy, adaptability to changing patterns, and the ability to leverage relationships between different metrics.

## Ensemble Forecasting

### Overview

Ensemble forecasting combines multiple forecasting models to improve prediction accuracy and robustness. The ensemble can use weighted averaging based on each model's historical performance.

### Basic Usage

```python
from app.ml.forecasting import ARIMAForecaster, ExponentialSmoothingForecaster, EnsembleForecaster

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

# Fit and predict
ensemble.fit(data, "energy_demand_kwh")
forecasts = ensemble.predict(n_periods=48)
```

### Ensemble Methods

The `ensemble_method` parameter controls how individual forecasts are combined:

- `simple`: Equal weights for all forecasters
- `weighted`: Weights based on validation performance (default)
- `stacked`: Meta-learner that learns optimal combination

### Handling Forecaster Unavailability

The ensemble is designed to work even if some forecasters (like LSTM) are unavailable due to missing dependencies:

```python
# This will work even if TensorFlow is not available
try:
    from app.ml.forecasting import LSTMForecaster
    ensemble.add_forecaster(LSTMForecaster(name="lstm_component"))
except ImportError:
    logger.warning("TensorFlow not available. LSTM not added to ensemble.")
```

### Visualizing Ensemble Weights

```python
import matplotlib.pyplot as plt

# Get ensemble weights
weights = ensemble.weights
forecaster_names = [f.__class__.__name__ for f in ensemble.forecasters]

plt.bar(forecaster_names, weights)
plt.title("Ensemble Weights")
plt.show()
```

## Model Selection

### Overview

The `ModelSelector` automatically analyzes data characteristics and selects the most appropriate forecasting model.

### Basic Usage

```python
from app.ml.forecasting import ModelSelector

# Create model selector
selector = ModelSelector(
    models_to_try=['arima', 'expsm', 'lstm', 'ensemble'],
    evaluation_metric='rmse',
    cross_validation=True,
    cv_folds=3
)

# Analyze data characteristics
characteristics = selector.analyze_data(data, "energy_demand_kwh")
print(f"Data characteristics: {characteristics}")

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

### Data Characteristics

The `analyze_data` method returns a dictionary with these characteristics:

- `is_stationary`: Whether the time series is stationary
- `adf_pvalue`: P-value from the Augmented Dickey-Fuller test
- `has_seasonality`: Whether seasonal patterns are detected
- `seasonal_periods`: List of detected seasonal periods
- `has_trend`: Whether a trend is detected
- `trend_direction`: Direction of the trend ('positive' or 'negative')
- `volatility`: Measure of data volatility

### Model Performance Comparison

```python
# Get performance of all models evaluated
performance = selector.model_performances
for model_name, metric_value in performance.items():
    print(f"{model_name}: {metric_value:.4f}")
```

## Online Learning

### Overview

Online learning enables models to continuously adapt to new data and detect when patterns change (concept drift).

### Basic Usage

```python
from app.ml.forecasting import ARIMAForecaster, OnlineForecaster

# Create base forecaster
base_forecaster = ARIMAForecaster(
    name="demand_forecaster",
    forecast_horizon=24,
    frequency='H'
)

# Wrap with online learning
online_forecaster = OnlineForecaster(
    base_forecaster=base_forecaster,
    update_frequency='D',
    retraining_window=7*24,  # 7 days of hourly data
    drift_detection_method='threshold',
    drift_threshold=0.3,
    performance_metric='rmse'
)

# Initial fitting
online_forecaster.fit(historical_data, "energy_demand_kwh")

# Update with new data (e.g., in a daily scheduled job)
update_result = online_forecaster.update(new_data)

# Check if drift was detected
if update_result["drift_detected"]:
    print("Pattern change detected! Model was automatically retrained.")

# Generate forecasts
forecasts = online_forecaster.predict(n_periods=48)
```

### Drift Detection Methods

The `drift_detection_method` parameter controls how pattern changes are detected:

- `threshold`: Simple threshold on performance change (default)
- `page_hinkley`: Page-Hinkley sequential change detection test
- `adwin`: Adaptive Windowing for distribution change detection

### Visualizing Performance History

```python
# Get performance history
performance_df = online_forecaster.get_performance_history()

# Plot performance over time with drift events
online_forecaster.plot_performance_history(
    include_drift_events=True,
    save_path="performance_history.png"
)
```

### Standalone Drift Detection

For more advanced drift detection needs, you can use the standalone `DriftDetector`:

```python
from app.ml.forecasting import DriftDetector

# Create drift detector
detector = DriftDetector(
    method='threshold',
    window_size=24,
    threshold=0.3,
    statistic='mean'
)

# Initialize with historical data
detector.initialize_reference(historical_data, "energy_demand_kwh")

# Check for drift in new data
drift_detected = detector.add_points(new_data, "energy_demand_kwh")

if drift_detected:
    print("Drift detected in new data!")
```

## Multi-Task Learning

### Overview

Multi-task learning enables simultaneous prediction of multiple related metrics (like energy demand, price, and battery degradation) for more efficient learning and improved accuracy.

### Basic Usage with Independent Models

```python
from app.ml.multitask import MultiTaskModel

# Create multi-task model
model = MultiTaskModel(
    name="charging_metrics",
    tasks=['energy_demand', 'energy_price', 'battery_degradation']
)

# Define task-to-column mapping
task_columns = {
    'energy_demand': 'energy_demand_kwh',
    'energy_price': 'price_per_kwh',
    'battery_degradation': 'degradation_rate'
}

# Define features
feature_columns = [
    'hour', 'day_of_week', 'temperature', 
    'previous_demand', 'is_weekend'
]

# Fit model
model.fit(
    data=training_data,
    task_columns=task_columns,
    feature_columns=feature_columns
)

# Generate predictions for all tasks
predictions = model.predict(new_data)

# Access specific task predictions
energy_demand_predictions = predictions['energy_demand']
```

### Shared Representation with Neural Networks

For more advanced multi-task learning that leverages shared representations:

```python
from app.ml.multitask import SharedRepresentationModel

# Create shared representation model
shared_model = SharedRepresentationModel(
    name="charging_metrics_shared",
    tasks=['energy_demand', 'energy_price', 'battery_degradation'],
    shared_layers=[64, 32],
    task_specific_layers=[16]
)

# Fit model (same parameters as MultiTaskModel)
shared_model.fit(
    data=training_data,
    task_columns=task_columns,
    feature_columns=feature_columns,
    epochs=100,
    batch_size=32
)

# Generate predictions
predictions = shared_model.predict(
    new_data,
    return_dataframe=True  # Return as DataFrame instead of dict
)
```

### Feature Importance Analysis

```python
# Get feature importance for a specific task
importance = model.feature_importance('energy_demand')

# Plot feature importance
model.plot_feature_importance(
    task='energy_demand',
    top_n=10,
    save_path='energy_demand_importance.png'
)
```

### Performance Evaluation

```python
# Evaluate performance on test data
metrics = ['rmse', 'mae', 'r2']
evaluation = model.evaluate(
    data=test_data,
    metrics=metrics
)

# Print results for each task
for task, task_metrics in evaluation.items():
    print(f"\n{task}:")
    for metric, value in task_metrics.items():
        print(f"  {metric.upper()}: {value:.4f}")
```

## Dashboard Integration

The advanced ML capabilities are integrated with the dashboard through two new components:

### Enhanced Forecast Dashboard

The Enhanced Forecast Dashboard (`app/dashboard/components/enhanced_forecast_dashboard.py`) provides interactive visualization of:

- Ensemble forecasts with confidence intervals
- Model selection results
- Online learning performance
- Drift detection events

Access it through the main ML dashboard by selecting "Enhanced Forecasting" from the navigation menu.

### Advanced ML Dashboard

The Advanced ML Dashboard (`app/dashboard/components/advanced_ml_dashboard.py`) provides visualization of:

- Multi-task predictions
- Feature importance across tasks
- Model ensemble weights
- Online learning performance over time

Access it through the main ML dashboard by selecting "Advanced ML Capabilities" from the navigation menu.

## API Reference

### Ensemble Forecasting

```python
EnsembleForecaster(
    name: str = "ensemble",
    forecast_horizon: int = 24,
    frequency: str = 'H',
    forecasters: Optional[List[BaseForecaster]] = None,
    ensemble_method: str = "weighted",
    model_dir: str = 'app/ml/models/forecasting'
)
```

#### Methods:
- `add_forecaster(forecaster: BaseForecaster) -> EnsembleForecaster`
- `create_default_ensemble() -> EnsembleForecaster`
- `fit(data: pd.DataFrame, target_col: str, **kwargs) -> EnsembleForecaster`
- `predict(start_date: Optional[pd.Timestamp] = None, n_periods: Optional[int] = None, exogenous_data: Optional[pd.DataFrame] = None, **kwargs) -> pd.DataFrame`
- `get_diagnostics(plot: bool = False, plot_path: Optional[str] = None) -> Dict[str, Any]`

### Model Selection

```python
ModelSelector(
    models_to_try: Optional[List[str]] = None,
    evaluation_metric: str = 'rmse',
    cross_validation: bool = True,
    cv_folds: int = 3
)
```

#### Methods:
- `analyze_data(data: pd.DataFrame, target_col: str) -> Dict[str, Any]`
- `select_best_model(data: pd.DataFrame, target_col: str, forecast_horizon: int = 24, frequency: str = 'H') -> BaseForecaster`

### Online Learning

```python
OnlineForecaster(
    base_forecaster: BaseForecaster,
    update_frequency: str = 'D',
    retraining_window: int = 30,
    drift_detection_method: str = 'threshold',
    drift_threshold: float = 0.3,
    performance_metric: str = 'rmse',
    max_online_window: int = 90
)
```

#### Methods:
- `fit(data: pd.DataFrame, target_col: str, **kwargs) -> OnlineForecaster`
- `predict(start_date: Optional[pd.Timestamp] = None, n_periods: Optional[int] = None, exogenous_data: Optional[pd.DataFrame] = None, **kwargs) -> pd.DataFrame`
- `update(new_data: pd.DataFrame, evaluate: bool = True, force_retrain: bool = False, **kwargs) -> Dict[str, Any]`
- `get_performance_history() -> pd.DataFrame`
- `get_drift_events() -> pd.DataFrame`
- `plot_performance_history(figsize: Tuple[int, int] = (12, 6), include_drift_events: bool = True, save_path: Optional[str] = None) -> None`

### Multi-Task Learning

```python
MultiTaskModel(
    name: str,
    tasks: List[str],
    model_dir: str = 'app/ml/models/multitask'
)
```

#### Methods:
- `fit(data: pd.DataFrame, task_columns: Dict[str, str], feature_columns: List[str], **kwargs) -> MultiTaskModel`
- `predict(data: pd.DataFrame, tasks: Optional[List[str]] = None) -> Dict[str, np.ndarray]`
- `evaluate(data: pd.DataFrame, metrics: List[str] = ['mse', 'mae', 'rmse'], tasks: Optional[List[str]] = None) -> Dict[str, Dict[str, float]]`
- `feature_importance(task: str) -> Dict[str, float]`
- `plot_feature_importance(task: str, top_n: int = 10, figsize: Tuple[int, int] = (10, 6), save_path: Optional[str] = None) -> None`

```python
SharedRepresentationModel(
    name: str,
    tasks: List[str],
    shared_layers: List[int] = [64, 32],
    task_specific_layers: List[int] = [16],
    model_dir: str = 'app/ml/models/multitask'
)
```

#### Methods:
- Same as MultiTaskModel, plus:
- `plot_training_history(figsize: Tuple[int, int] = (12, 6), save_path: Optional[str] = None) -> None`

## Performance Considerations

### Memory Usage

- **Ensemble Models**: Require more memory as they maintain multiple forecasters
- **Online Learning**: Stores historical data for drift detection and retraining
- **Multi-Task Models**: May require more memory for shared neural network models

### Computation Time

- **Model Selection**: Cross-validation increases computation time during initial setup
- **LSTM Models**: Require significantly more computation than statistical models
- **Stacked Ensembles**: Need more training time than simple or weighted ensembles

### Optimization Tips

1. **For faster inference**:
   - Use `simple` ensemble method instead of `weighted` or `stacked`
   - Use smaller `retraining_window` in OnlineForecaster
   - Disable unused forecasters in the ensemble

2. **For lower memory usage**:
   - Reduce `max_online_window` in OnlineForecaster
   - Use smaller neural network architectures in SharedRepresentationModel
   - Limit the number of models in your ensemble

3. **For better accuracy**:
   - Use `stacked` ensemble method
   - Increase cross-validation folds in ModelSelector
   - Use larger neural networks for SharedRepresentationModel

## Troubleshooting

### TensorFlow Unavailability

If TensorFlow is not available, the system will automatically fall back to statistical models. To install TensorFlow:

```bash
pip install tensorflow==2.8.0
```

Check for TensorFlow availability:

```python
from app.ml.check_installation import check_imports
check_imports()
```

### Memory Errors

If you encounter memory errors with large datasets:

1. Reduce the `retraining_window` in OnlineForecaster
2. Use smaller neural networks in SharedRepresentationModel
3. Reduce the number of models in your ensemble
4. Process data in smaller batches

### Drift Detection Issues

If drift detection is too sensitive or not sensitive enough:

1. Adjust `drift_threshold` in OnlineForecaster (higher = less sensitive)
2. Try different `drift_detection_method` options
3. Increase `update_frequency` for more frequent checks

### Poor Multi-Task Performance

If multi-task models aren't performing well:

1. Check if tasks are truly related (should have some shared patterns)
2. Increase training data size
3. Try adjusting layer sizes in SharedRepresentationModel
4. Consider reverting to separate models for unrelated tasks 