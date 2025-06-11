"""
Multi-Task Learning Example

This script demonstrates the multi-task learning capabilities for
simultaneously predicting multiple related metrics for EV charging stations.
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

from app.ml.multitask import MultiTaskModel, SharedRepresentationModel

def generate_correlated_data(n_samples: int = 5000) -> pd.DataFrame:
    """
    Generate synthetic data with correlated targets
    
    Args:
        n_samples: Number of samples to generate
        
    Returns:
        DataFrame with features and correlated targets
    """
    # Generate dates
    base_date = datetime(2023, 1, 1)
    dates = [base_date + timedelta(hours=i) for i in range(n_samples)]
    
    # Generate features
    np.random.seed(42)
    
    # Time-based features
    hour_of_day = np.array([d.hour for d in dates])
    day_of_week = np.array([d.weekday() for d in dates])
    is_weekend = (day_of_week >= 5).astype(int)
    month = np.array([d.month for d in dates])
    
    # Temperature follows a seasonal pattern with random noise
    temperature = 20 + 15 * np.sin(np.linspace(0, 4*np.pi, n_samples)) + np.random.normal(0, 3, n_samples)
    
    # Random features
    feature1 = np.random.normal(0, 1, n_samples)
    feature2 = np.random.normal(0, 1, n_samples)
    feature3 = np.random.normal(0, 1, n_samples)
    
    # Generate targets with shared patterns
    # Base patterns that will influence all targets
    base_pattern1 = 10 * np.sin(np.linspace(0, 8*np.pi, n_samples))  # Longer cycle
    base_pattern2 = 5 * np.cos(np.linspace(0, 16*np.pi, n_samples))  # Shorter cycle
    
    # Time-based patterns
    hour_pattern = np.array([10 + 15 * np.sin(h * np.pi / 12) for h in hour_of_day])
    weekday_pattern = np.array([1.0, 1.1, 1.2, 1.3, 1.4, 0.8, 0.7][d] for d in day_of_week)
    
    # Target 1: Energy demand - heavily influenced by hour, temperature, and weekday
    energy_demand = (
        50 +  # Base demand
        hour_pattern +  # Hour of day effect
        0.5 * temperature +  # Temperature effect (higher temp -> more AC use)
        10 * weekday_pattern +  # Day of week effect
        0.2 * base_pattern1 +  # Long-term pattern
        5 * is_weekend +  # Weekend effect
        np.random.normal(0, 5, n_samples)  # Random noise
    )
    
    # Target 2: Energy price - correlated with demand but with different patterns
    energy_price = (
        20 +  # Base price
        0.2 * energy_demand +  # Demand effect on price
        0.3 * base_pattern1 +  # Long-term pattern
        0.5 * base_pattern2 +  # Short-term fluctuations
        2 * is_weekend +  # Weekend effect
        np.random.normal(0, 2, n_samples)  # Random noise
    )
    
    # Target 3: Battery degradation - influenced by temperature and usage
    battery_degradation = (
        0.01 +  # Base degradation
        0.0001 * energy_demand +  # Usage effect
        0.002 * np.maximum(0, temperature - 25) +  # High temperature effect
        0.0005 * base_pattern1 +  # Long-term pattern
        0.001 * np.random.normal(0, 1, n_samples)  # Random noise
    )
    
    # Create DataFrame
    data = pd.DataFrame({
        'timestamp': dates,
        'hour': hour_of_day,
        'day_of_week': day_of_week,
        'is_weekend': is_weekend,
        'month': month,
        'temperature': temperature,
        'feature1': feature1,
        'feature2': feature2,
        'feature3': feature3,
        'energy_demand': energy_demand,
        'energy_price': energy_price,
        'battery_degradation': battery_degradation
    })
    
    data['sin_hour'] = np.sin(2 * np.pi * data['hour'] / 24)
    data['cos_hour'] = np.cos(2 * np.pi * data['hour'] / 24)
    data['sin_day'] = np.sin(2 * np.pi * data['day_of_week'] / 7)
    data['cos_day'] = np.cos(2 * np.pi * data['day_of_week'] / 7)
    data['sin_month'] = np.sin(2 * np.pi * data['month'] / 12)
    data['cos_month'] = np.cos(2 * np.pi * data['month'] / 12)
    
    data.set_index('timestamp', inplace=True)
    
    return data

def demonstrate_independent_models():
    """
    Demonstrate independent multi-task models
    """
    print("=" * 50)
    print("INDEPENDENT MULTI-TASK MODELS")
    print("=" * 50)
    
    # Generate data
    print("Generating synthetic data...")
    data = generate_correlated_data(n_samples=5000)
    print(f"Generated {len(data)} data points")
    
    # Split into train/test
    train_size = int(len(data) * 0.8)
    train_data = data.iloc[:train_size]
    test_data = data.iloc[train_size:]
    
    print(f"Training data: {len(train_data)} points")
    print(f"Testing data: {len(test_data)} points")
    
    # Define tasks
    tasks = ['energy_demand', 'energy_price', 'battery_degradation']
    
    # Define features
    feature_columns = [
        'hour', 'day_of_week', 'is_weekend', 'month', 'temperature',
        'feature1', 'feature2', 'feature3',
        'sin_hour', 'cos_hour', 'sin_day', 'cos_day', 'sin_month', 'cos_month'
    ]
    
    # Create task-to-column mapping
    task_columns = {task: task for task in tasks}
    
    # Create multi-task model
    print("\nCreating multi-task model...")
    model = MultiTaskModel(
        name="charging_station_model",
        tasks=tasks
    )
    
    # Fit the model
    print("Fitting model...")
    model.fit(
        data=train_data,
        task_columns=task_columns,
        feature_columns=feature_columns
    )
    
    # Evaluate on test data
    print("\nEvaluating model on test data...")
    metrics = ['rmse', 'mae', 'r2']
    evaluation = model.evaluate(
        data=test_data,
        metrics=metrics
    )
    
    # Print results
    print("\nEvaluation Results:")
    for task, task_metrics in evaluation.items():
        print(f"\n{task}:")
        for metric, value in task_metrics.items():
            print(f"  {metric.upper()}: {value:.4f}")
    
    # Generate predictions
    print("\nGenerating predictions...")
    predictions = model.predict(test_data)
    
    # Plot predictions vs actual for each task
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    # Create figure with 3 subplots
    fig, axes = plt.subplots(len(tasks), 1, figsize=(12, 15))
    
    # Plot each task
    for i, task in enumerate(tasks):
        ax = axes[i]
        
        # Plot actual values
        ax.plot(test_data.index, test_data[task], label='Actual', color='blue')
        
        # Plot predictions
        ax.plot(test_data.index, predictions[task], label='Predicted', color='red')
        
        ax.set_title(f"{task} - Predictions vs Actual")
        ax.set_xlabel('Time')
        ax.set_ylabel(task)
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'multitask_predictions.png')
    print(f"\nSaved predictions plot to {output_dir / 'multitask_predictions.png'}")
    plt.close()
    
    # Plot feature importance for each task
    fig, axes = plt.subplots(len(tasks), 1, figsize=(12, 15))
    
    for i, task in enumerate(tasks):
        ax = axes[i]
        
        # Get feature importance
        importance = model.feature_importance(task)
        
        # Sort features by importance
        sorted_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)
        
        # Take top 10 features
        top_features = sorted_features[:10]
        
        # Plot feature importance
        features, values = zip(*top_features)
        ax.barh(features, values)
        
        ax.set_title(f"Feature Importance for {task}")
        ax.set_xlabel("Importance")
        ax.set_ylabel("Feature")
    
    plt.tight_layout()
    plt.savefig(output_dir / 'multitask_feature_importance.png')
    print(f"Saved feature importance plot to {output_dir / 'multitask_feature_importance.png'}")
    plt.close()

def demonstrate_shared_model():
    """
    Demonstrate shared representation multi-task model
    """
    print("\n" + "=" * 50)
    print("SHARED REPRESENTATION MULTI-TASK MODEL")
    print("=" * 50)
    
    # Check if TensorFlow is available
    try:
        import tensorflow as tf
        print(f"TensorFlow version: {tf.__version__}")
    except ImportError:
        print("TensorFlow not available. Skipping shared representation model.")
        return
    
    # Generate data
    print("Generating synthetic data...")
    data = generate_correlated_data(n_samples=5000)
    print(f"Generated {len(data)} data points")
    
    # Split into train/test
    train_size = int(len(data) * 0.8)
    train_data = data.iloc[:train_size]
    test_data = data.iloc[train_size:]
    
    print(f"Training data: {len(train_data)} points")
    print(f"Testing data: {len(test_data)} points")
    
    # Define tasks
    tasks = ['energy_demand', 'energy_price', 'battery_degradation']
    
    # Define features
    feature_columns = [
        'hour', 'day_of_week', 'is_weekend', 'month', 'temperature',
        'feature1', 'feature2', 'feature3',
        'sin_hour', 'cos_hour', 'sin_day', 'cos_day', 'sin_month', 'cos_month'
    ]
    
    # Create task-to-column mapping
    task_columns = {task: task for task in tasks}
    
    # Create shared representation model
    print("\nCreating shared representation model...")
    shared_model = SharedRepresentationModel(
        name="charging_station_shared_model",
        tasks=tasks,
        shared_layers=[64, 32],
        task_specific_layers=[16]
    )
    
    # Fit the model
    print("Fitting model...")
    shared_model.fit(
        data=train_data,
        task_columns=task_columns,
        feature_columns=feature_columns,
        epochs=50,  # Reduced for demonstration
        batch_size=32,
        validation_split=0.2,
        verbose=1
    )
    
    # Evaluate on test data
    print("\nEvaluating model on test data...")
    metrics = ['rmse', 'mae', 'r2']
    evaluation = shared_model.evaluate(
        data=test_data,
        metrics=metrics
    )
    
    # Print results
    print("\nEvaluation Results:")
    for task, task_metrics in evaluation.items():
        print(f"\n{task}:")
        for metric, value in task_metrics.items():
            print(f"  {metric.upper()}: {value:.4f}")
    
    # Generate predictions
    print("\nGenerating predictions...")
    predictions = shared_model.predict(test_data, return_dataframe=True)
    
    # Plot predictions vs actual for each task
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    # Create figure with 3 subplots
    fig, axes = plt.subplots(len(tasks), 1, figsize=(12, 15))
    
    # Plot each task
    for i, task in enumerate(tasks):
        ax = axes[i]
        
        # Plot actual values
        ax.plot(test_data.index, test_data[task], label='Actual', color='blue')
        
        # Plot predictions
        ax.plot(test_data.index, predictions[task], label='Predicted', color='green')
        
        ax.set_title(f"{task} - Predictions vs Actual (Shared Model)")
        ax.set_xlabel('Time')
        ax.set_ylabel(task)
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'shared_model_predictions.png')
    print(f"\nSaved predictions plot to {output_dir / 'shared_model_predictions.png'}")
    plt.close()
    
    # Plot training history
    shared_model.plot_training_history(
        save_path=output_dir / 'shared_model_training_history.png'
    )
    print(f"Saved training history plot to {output_dir / 'shared_model_training_history.png'}")

def compare_models():
    """
    Compare independent and shared models
    """
    # Check if TensorFlow is available
    try:
        import tensorflow as tf
    except ImportError:
        print("TensorFlow not available. Skipping model comparison.")
        return
    
    print("\n" + "=" * 50)
    print("MODEL COMPARISON")
    print("=" * 50)
    
    # Generate data
    print("Generating synthetic data...")
    data = generate_correlated_data(n_samples=5000)
    
    # Split into train/validation/test
    train_size = int(len(data) * 0.6)
    val_size = int(len(data) * 0.2)
    
    train_data = data.iloc[:train_size]
    val_data = data.iloc[train_size:train_size+val_size]
    test_data = data.iloc[train_size+val_size:]
    
    print(f"Training data: {len(train_data)} points")
    print(f"Validation data: {len(val_data)} points")
    print(f"Testing data: {len(test_data)} points")
    
    # Define tasks
    tasks = ['energy_demand', 'energy_price', 'battery_degradation']
    
    # Define features
    feature_columns = [
        'hour', 'day_of_week', 'is_weekend', 'month', 'temperature',
        'feature1', 'feature2', 'feature3',
        'sin_hour', 'cos_hour', 'sin_day', 'cos_day', 'sin_month', 'cos_month'
    ]
    
    # Create task-to-column mapping
    task_columns = {task: task for task in tasks}
    
    # Create models
    print("\nCreating models...")
    independent_model = MultiTaskModel(
        name="independent_model",
        tasks=tasks
    )
    
    shared_model = SharedRepresentationModel(
        name="shared_model",
        tasks=tasks,
        shared_layers=[64, 32],
        task_specific_layers=[16]
    )
    
    # Fit models
    print("Fitting independent model...")
    independent_model.fit(
        data=train_data,
        task_columns=task_columns,
        feature_columns=feature_columns
    )
    
    print("Fitting shared model...")
    shared_model.fit(
        data=train_data,
        task_columns=task_columns,
        feature_columns=feature_columns,
        epochs=50,  # Reduced for demonstration
        batch_size=32,
        validation_split=0.2,
        verbose=1
    )
    
    # Evaluate on test data
    print("\nEvaluating models on test data...")
    metrics = ['rmse', 'r2']
    
    independent_eval = independent_model.evaluate(
        data=test_data,
        metrics=metrics
    )
    
    shared_eval = shared_model.evaluate(
        data=test_data,
        metrics=metrics
    )
    
    # Compare results
    print("\nModel Comparison (RMSE - lower is better):")
    print(f"{'Task':<20} {'Independent':<15} {'Shared':<15} {'Improvement':<15}")
    print("-" * 65)
    
    for task in tasks:
        indep_rmse = independent_eval[task]['rmse']
        shared_rmse = shared_eval[task]['rmse']
        improvement = (indep_rmse - shared_rmse) / indep_rmse * 100
        
        print(f"{task:<20} {indep_rmse:<15.4f} {shared_rmse:<15.4f} {improvement:<15.2f}%")
    
    print("\nModel Comparison (R² - higher is better):")
    print(f"{'Task':<20} {'Independent':<15} {'Shared':<15} {'Improvement':<15}")
    print("-" * 65)
    
    for task in tasks:
        indep_r2 = independent_eval[task]['r2']
        shared_r2 = shared_eval[task]['r2']
        improvement = (shared_r2 - indep_r2) / max(0.0001, abs(indep_r2)) * 100
        
        print(f"{task:<20} {indep_r2:<15.4f} {shared_r2:<15.4f} {improvement:<15.2f}%")
    
    # Generate predictions
    independent_preds = independent_model.predict(test_data)
    shared_preds = shared_model.predict(test_data, return_dataframe=True)
    
    # Plot comparison for each task
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    # Sample a subset of data for clarity
    sample_size = min(500, len(test_data))
    sample_indices = np.linspace(0, len(test_data)-1, sample_size, dtype=int)
    
    sample_test = test_data.iloc[sample_indices]
    
    # Create figure with 3 subplots
    fig, axes = plt.subplots(len(tasks), 1, figsize=(12, 15))
    
    # Plot each task
    for i, task in enumerate(tasks):
        ax = axes[i]
        
        # Plot actual values
        ax.plot(sample_test.index, sample_test[task], label='Actual', color='black')
        
        # Plot independent model predictions
        ax.plot(
            sample_test.index, 
            independent_preds[task][sample_indices], 
            label='Independent', 
            color='red',
            linestyle='--'
        )
        
        # Plot shared model predictions
        ax.plot(
            sample_test.index, 
            shared_preds[task].iloc[sample_indices], 
            label='Shared', 
            color='green',
            linestyle='-.'
        )
        
        ax.set_title(f"{task} - Model Comparison")
        ax.set_xlabel('Time')
        ax.set_ylabel(task)
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'model_comparison.png')
    print(f"\nSaved comparison plot to {output_dir / 'model_comparison.png'}")
    plt.close()

def main():
    """Main function to run all demonstrations"""
    # Create output directory
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    # Run demonstrations
    demonstrate_independent_models()
    demonstrate_shared_model()
    compare_models()
    
    print("\nAll demonstrations completed. Results saved to the 'output' directory.")

if __name__ == "__main__":
    main() 