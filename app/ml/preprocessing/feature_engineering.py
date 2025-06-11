"""
Feature Engineering Module

This module contains utilities for creating features from raw data
for various machine learning models in the GIU EV Charging Infrastructure.
"""
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union


def extract_time_features(df: pd.DataFrame, timestamp_col: str = 'timestamp') -> pd.DataFrame:
    """
    Extract time-based features from a timestamp column
    
    Args:
        df: DataFrame containing timestamp data
        timestamp_col: Name of the timestamp column
        
    Returns:
        DataFrame with additional time features
    """
    # Make a copy to avoid modifying the original dataframe
    result = df.copy()
    
    # Convert to datetime if needed
    if not pd.api.types.is_datetime64_dtype(result[timestamp_col]):
        result[timestamp_col] = pd.to_datetime(result[timestamp_col])
    
    # Extract time features
    result['hour_of_day'] = result[timestamp_col].dt.hour
    result['day_of_week'] = result[timestamp_col].dt.dayofweek
    result['month'] = result[timestamp_col].dt.month
    result['is_weekend'] = result['day_of_week'].isin([5, 6]).astype(int)
    result['day_part'] = pd.cut(
        result['hour_of_day'],
        bins=[0, 6, 12, 18, 24],
        labels=['night', 'morning', 'afternoon', 'evening'],
        include_lowest=True
    )
    
    # Cyclical encoding of time features
    result['hour_sin'] = np.sin(2 * np.pi * result['hour_of_day'] / 24)
    result['hour_cos'] = np.cos(2 * np.pi * result['hour_of_day'] / 24)
    result['day_sin'] = np.sin(2 * np.pi * result['day_of_week'] / 7)
    result['day_cos'] = np.cos(2 * np.pi * result['day_of_week'] / 7)
    result['month_sin'] = np.sin(2 * np.pi * result['month'] / 12)
    result['month_cos'] = np.cos(2 * np.pi * result['month'] / 12)
    
    return result


def create_battery_health_features(
    telemetry_df: pd.DataFrame,
    vehicle_metadata: Optional[Dict] = None
) -> pd.DataFrame:
    """
    Creates features for battery health prediction from telemetry data
    
    Args:
        telemetry_df: DataFrame with battery telemetry data
        vehicle_metadata: Optional dictionary with vehicle metadata
        
    Returns:
        DataFrame with battery health features
    """
    features = telemetry_df.copy()
    
    # Calculate charge cycles
    if 'charging_status' in features.columns:
        features['charge_cycle'] = (
            (features['charging_status'].shift(1) == 0) & 
            (features['charging_status'] == 1)
        ).astype(int).cumsum()
    
    # Calculate depth of discharge
    if 'state_of_charge' in features.columns:
        features['min_soc_per_cycle'] = features.groupby('charge_cycle')['state_of_charge'].transform('min')
        features['max_soc_per_cycle'] = features.groupby('charge_cycle')['state_of_charge'].transform('max')
        features['depth_of_discharge'] = features['max_soc_per_cycle'] - features['min_soc_per_cycle']
    
    # Calculate temperature-related features
    if 'battery_temp' in features.columns:
        features['daily_max_temp'] = features.groupby(features['timestamp'].dt.date)['battery_temp'].transform('max')
        features['daily_min_temp'] = features.groupby(features['timestamp'].dt.date)['battery_temp'].transform('min')
        features['daily_temp_range'] = features['daily_max_temp'] - features['daily_min_temp']
        features['temp_outside_optimal'] = (
            (features['battery_temp'] < 10) | (features['battery_temp'] > 35)
        ).astype(int)
    
    # Add vehicle metadata features if available
    if vehicle_metadata:
        for key, value in vehicle_metadata.items():
            features[key] = value
    
    return features


def create_charging_optimization_features(charging_data: pd.DataFrame) -> pd.DataFrame:
    """
    Creates features for charging optimization models
    
    Args:
        charging_data: DataFrame with charging session data
        
    Returns:
        DataFrame with features for charging optimization
    """
    features = charging_data.copy()
    
    # Extract time features
    features = extract_time_features(features, 'session_start_time')
    
    # Calculate charging session features
    if 'session_duration' in features.columns:
        features['charging_speed'] = features['energy_delivered'] / features['session_duration']
    
    # Add charging pattern features
    if 'user_id' in features.columns and 'session_start_time' in features.columns:
        # Average start time for each user
        user_avg_start = features.groupby('user_id')['hour_of_day'].transform('mean')
        features['start_time_vs_avg'] = features['hour_of_day'] - user_avg_start
        
        # Regularity of charging (at similar times)
        user_std_start = features.groupby('user_id')['hour_of_day'].transform('std')
        features['user_charging_regularity'] = 1 / (user_std_start + 1)  # Higher value = more regular
    
    return features


def create_grid_integration_features(
    grid_data: pd.DataFrame,
    energy_price_data: Optional[pd.DataFrame] = None
) -> pd.DataFrame:
    """
    Creates features for grid integration models
    
    Args:
        grid_data: DataFrame with grid status data
        energy_price_data: Optional DataFrame with energy price data
        
    Returns:
        DataFrame with features for grid integration models
    """
    features = grid_data.copy()
    
    # Extract time features
    features = extract_time_features(features)
    
    # Create load features
    if 'grid_load' in features.columns:
        features['daily_peak_load'] = features.groupby(features['timestamp'].dt.date)['grid_load'].transform('max')
        features['load_vs_daily_peak'] = features['grid_load'] / features['daily_peak_load']
        
        # Time windows
        features['load_1h_ago'] = features.groupby(features['timestamp'].dt.date)['grid_load'].shift(1)
        features['load_change_1h'] = features['grid_load'] - features['load_1h_ago']
    
    # Merge with price data if available
    if energy_price_data is not None:
        # Ensure timestamp columns are compatible
        if 'timestamp' in energy_price_data.columns:
            energy_price_data = energy_price_data.rename(columns={'timestamp': 'price_timestamp'})
        
        # Merge and create price features
        features = pd.merge_asof(
            features.sort_values('timestamp'),
            energy_price_data.sort_values('price_timestamp'),
            left_on='timestamp',
            right_on='price_timestamp',
            direction='nearest'
        )
        
        # Calculate price-related features
        if 'energy_price' in features.columns:
            features['daily_min_price'] = features.groupby(features['timestamp'].dt.date)['energy_price'].transform('min')
            features['price_vs_daily_min'] = features['energy_price'] / features['daily_min_price']
    
    return features


def normalize_features(df: pd.DataFrame, exclude_cols: List[str] = None) -> Tuple[pd.DataFrame, Dict]:
    """
    Normalize numerical features using min-max scaling
    
    Args:
        df: DataFrame with features to normalize
        exclude_cols: List of columns to exclude from normalization
        
    Returns:
        Tuple of (normalized DataFrame, dictionary of normalization parameters)
    """
    if exclude_cols is None:
        exclude_cols = []
    
    result = df.copy()
    norm_params = {}
    
    for col in df.columns:
        if col in exclude_cols or not pd.api.types.is_numeric_dtype(df[col]):
            continue
        
        col_min = df[col].min()
        col_max = df[col].max()
        
        # Store normalization parameters
        norm_params[col] = {'min': col_min, 'max': col_max}
        
        # Apply normalization only if there's a range
        if col_max > col_min:
            result[col] = (df[col] - col_min) / (col_max - col_min)
    
    return result, norm_params


def create_sequence_features(
    df: pd.DataFrame,
    sequence_col: str,
    feature_cols: List[str],
    window_size: int = 24
) -> pd.DataFrame:
    """
    Create sequence features (useful for time series models)
    
    Args:
        df: DataFrame with time series data
        sequence_col: Column to sequence by (e.g., vehicle_id)
        feature_cols: Columns to create sequences for
        window_size: Size of the sliding window
        
    Returns:
        DataFrame with sequence features
    """
    result = []
    
    # Process each sequence separately
    for seq_id, group in df.groupby(sequence_col):
        group = group.sort_values('timestamp')
        
        for i in range(len(group) - window_size + 1):
            window = group.iloc[i:i+window_size]
            row = {'sequence_id': seq_id}
            
            # Add window data for each feature
            for col in feature_cols:
                for j in range(window_size):
                    row[f'{col}_t-{window_size-j}'] = window[col].iloc[j]
            
            result.append(row)
    
    return pd.DataFrame(result)


def detect_anomalies(
    df: pd.DataFrame,
    feature_col: str,
    window_size: int = 24,
    std_threshold: float = 3.0
) -> pd.DataFrame:
    """
    Detect anomalies using a moving window and standard deviation
    
    Args:
        df: DataFrame with time series data
        feature_col: Column to detect anomalies in
        window_size: Size of the moving window
        std_threshold: Number of standard deviations for anomaly threshold
        
    Returns:
        DataFrame with anomaly flags
    """
    result = df.copy()
    
    # Calculate rolling statistics
    result[f'{feature_col}_rolling_mean'] = result[feature_col].rolling(window=window_size, min_periods=1).mean()
    result[f'{feature_col}_rolling_std'] = result[feature_col].rolling(window=window_size, min_periods=1).std()
    
    # Calculate upper and lower bounds
    result[f'{feature_col}_upper_bound'] = (
        result[f'{feature_col}_rolling_mean'] + 
        std_threshold * result[f'{feature_col}_rolling_std']
    )
    result[f'{feature_col}_lower_bound'] = (
        result[f'{feature_col}_rolling_mean'] - 
        std_threshold * result[f'{feature_col}_rolling_std']
    )
    
    # Flag anomalies
    result[f'{feature_col}_anomaly'] = (
        (result[feature_col] > result[f'{feature_col}_upper_bound']) | 
        (result[feature_col] < result[f'{feature_col}_lower_bound'])
    ).astype(int)
    
    return result 