"""
Data Normalization Module

This module contains utilities for normalizing and standardizing data
for machine learning models in the GIU EV Charging Infrastructure.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Union, Optional
import joblib
import os


class DataNormalizer:
    """Class for normalizing data using different techniques"""
    
    def __init__(self, method: str = 'min_max', feature_range: Tuple[float, float] = (0, 1)):
        """
        Initialize the normalizer
        
        Args:
            method: Normalization method ('min_max', 'z_score', or 'robust')
            feature_range: Range for min-max scaling
        """
        self.method = method
        self.feature_range = feature_range
        self.params = {}
        self.categorical_columns = []
    
    def fit(self, df: pd.DataFrame, exclude_cols: Optional[List[str]] = None) -> 'DataNormalizer':
        """
        Calculate normalization parameters from a dataframe
        
        Args:
            df: DataFrame to calculate parameters from
            exclude_cols: Columns to exclude from normalization
            
        Returns:
            self
        """
        if exclude_cols is None:
            exclude_cols = []
            
        self.params = {}
        self.categorical_columns = []
        
        for col in df.columns:
            if col in exclude_cols:
                continue
                
            # Skip non-numeric columns
            if not pd.api.types.is_numeric_dtype(df[col]):
                self.categorical_columns.append(col)
                continue
                
            if self.method == 'min_max':
                col_min = df[col].min()
                col_max = df[col].max()
                self.params[col] = {'min': col_min, 'max': col_max}
                
            elif self.method == 'z_score':
                col_mean = df[col].mean()
                col_std = df[col].std()
                if col_std == 0:  # Handle zero standard deviation
                    col_std = 1
                self.params[col] = {'mean': col_mean, 'std': col_std}
                
            elif self.method == 'robust':
                col_median = df[col].median()
                col_iqr = df[col].quantile(0.75) - df[col].quantile(0.25)
                if col_iqr == 0:  # Handle zero IQR
                    col_iqr = 1
                self.params[col] = {'median': col_median, 'iqr': col_iqr}
        
        return self
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply normalization to a dataframe using stored parameters
        
        Args:
            df: DataFrame to normalize
            
        Returns:
            Normalized DataFrame
        """
        result = df.copy()
        
        for col in self.params:
            if col not in result.columns:
                continue
                
            if self.method == 'min_max':
                col_min = self.params[col]['min']
                col_max = self.params[col]['max']
                if col_max > col_min:  # Only normalize if there's a range
                    result[col] = (result[col] - col_min) / (col_max - col_min)
                    # Scale to feature range if not (0,1)
                    if self.feature_range != (0, 1):
                        min_range, max_range = self.feature_range
                        result[col] = result[col] * (max_range - min_range) + min_range
                
            elif self.method == 'z_score':
                col_mean = self.params[col]['mean']
                col_std = self.params[col]['std']
                result[col] = (result[col] - col_mean) / col_std
                
            elif self.method == 'robust':
                col_median = self.params[col]['median']
                col_iqr = self.params[col]['iqr']
                result[col] = (result[col] - col_median) / col_iqr
        
        return result
    
    def fit_transform(self, df: pd.DataFrame, exclude_cols: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Calculate parameters and normalize in one step
        
        Args:
            df: DataFrame to normalize
            exclude_cols: Columns to exclude from normalization
            
        Returns:
            Normalized DataFrame
        """
        self.fit(df, exclude_cols)
        return self.transform(df)
    
    def inverse_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Reverse the normalization
        
        Args:
            df: Normalized DataFrame
            
        Returns:
            DataFrame in original scale
        """
        result = df.copy()
        
        for col in self.params:
            if col not in result.columns:
                continue
                
            if self.method == 'min_max':
                col_min = self.params[col]['min']
                col_max = self.params[col]['max']
                
                # Reverse feature range scaling if applicable
                if self.feature_range != (0, 1):
                    min_range, max_range = self.feature_range
                    result[col] = (result[col] - min_range) / (max_range - min_range)
                
                # Reverse min-max normalization
                result[col] = result[col] * (col_max - col_min) + col_min
                
            elif self.method == 'z_score':
                col_mean = self.params[col]['mean']
                col_std = self.params[col]['std']
                result[col] = result[col] * col_std + col_mean
                
            elif self.method == 'robust':
                col_median = self.params[col]['median']
                col_iqr = self.params[col]['iqr']
                result[col] = result[col] * col_iqr + col_median
        
        return result
    
    def save(self, filepath: str) -> None:
        """
        Save the normalizer parameters to a file
        
        Args:
            filepath: Path to save the parameters
        """
        joblib.dump({
            'method': self.method,
            'feature_range': self.feature_range,
            'params': self.params,
            'categorical_columns': self.categorical_columns
        }, filepath)
    
    @classmethod
    def load(cls, filepath: str) -> 'DataNormalizer':
        """
        Load a normalizer from a file
        
        Args:
            filepath: Path to load the parameters from
            
        Returns:
            Loaded DataNormalizer instance
        """
        data = joblib.load(filepath)
        normalizer = cls(method=data['method'], feature_range=data['feature_range'])
        normalizer.params = data['params']
        normalizer.categorical_columns = data['categorical_columns']
        return normalizer


def one_hot_encode(
    df: pd.DataFrame, 
    categorical_cols: List[str],
    drop_original: bool = True
) -> pd.DataFrame:
    """
    One-hot encode categorical columns
    
    Args:
        df: DataFrame with categorical columns
        categorical_cols: List of categorical columns to encode
        drop_original: Whether to drop the original columns
        
    Returns:
        DataFrame with one-hot encoded columns
    """
    result = df.copy()
    
    for col in categorical_cols:
        if col not in result.columns:
            continue
            
        # Get dummies for the categorical column
        dummies = pd.get_dummies(result[col], prefix=col, drop_first=False)
        
        # Add dummy columns to result
        result = pd.concat([result, dummies], axis=1)
        
        # Drop original column if specified
        if drop_original:
            result = result.drop(columns=[col])
    
    return result


def apply_cyclical_encoding(
    df: pd.DataFrame,
    cyclical_cols: Dict[str, int],
    drop_original: bool = True
) -> pd.DataFrame:
    """
    Apply cyclical encoding to specified columns (for time features, etc.)
    
    Args:
        df: DataFrame with cyclical columns
        cyclical_cols: Dict mapping column names to their cycle lengths
        drop_original: Whether to drop the original columns
        
    Returns:
        DataFrame with cyclically encoded columns
    """
    result = df.copy()
    
    for col, cycle_length in cyclical_cols.items():
        if col not in result.columns:
            continue
            
        # Apply sine and cosine transformations
        result[f"{col}_sin"] = np.sin(2 * np.pi * result[col] / cycle_length)
        result[f"{col}_cos"] = np.cos(2 * np.pi * result[col] / cycle_length)
        
        # Drop original column if specified
        if drop_original:
            result = result.drop(columns=[col])
    
    return result


def handle_outliers(
    df: pd.DataFrame,
    numeric_cols: Optional[List[str]] = None,
    method: str = 'clip',
    std_threshold: float = 3.0
) -> pd.DataFrame:
    """
    Handle outliers in numerical columns
    
    Args:
        df: DataFrame with potential outliers
        numeric_cols: List of numerical columns to process (if None, all numeric)
        method: Method to handle outliers ('clip', 'remove', or 'winsorize')
        std_threshold: Threshold in standard deviations for outlier detection
        
    Returns:
        DataFrame with handled outliers
    """
    result = df.copy()
    
    # If no columns specified, use all numeric columns
    if numeric_cols is None:
        numeric_cols = result.select_dtypes(include=np.number).columns.tolist()
    
    for col in numeric_cols:
        if col not in result.columns:
            continue
            
        # Calculate bounds based on standard deviation
        col_mean = result[col].mean()
        col_std = result[col].std()
        lower_bound = col_mean - std_threshold * col_std
        upper_bound = col_mean + std_threshold * col_std
        
        if method == 'clip':
            # Clip values to the bounds
            result[col] = result[col].clip(lower=lower_bound, upper=upper_bound)
            
        elif method == 'remove':
            # Remove rows with outliers
            mask = (result[col] >= lower_bound) & (result[col] <= upper_bound)
            result = result[mask]
            
        elif method == 'winsorize':
            # Replace outliers with the bounds
            result.loc[result[col] < lower_bound, col] = lower_bound
            result.loc[result[col] > upper_bound, col] = upper_bound
    
    return result


def impute_missing_values(
    df: pd.DataFrame,
    numeric_strategy: str = 'mean',
    categorical_strategy: str = 'mode'
) -> pd.DataFrame:
    """
    Impute missing values in a DataFrame
    
    Args:
        df: DataFrame with missing values
        numeric_strategy: Strategy for numeric columns ('mean', 'median', or 'zero')
        categorical_strategy: Strategy for categorical columns ('mode' or 'missing')
        
    Returns:
        DataFrame with imputed values
    """
    result = df.copy()
    
    # Process numeric columns
    numeric_cols = result.select_dtypes(include=np.number).columns
    for col in numeric_cols:
        if result[col].isna().any():
            if numeric_strategy == 'mean':
                result[col] = result[col].fillna(result[col].mean())
            elif numeric_strategy == 'median':
                result[col] = result[col].fillna(result[col].median())
            elif numeric_strategy == 'zero':
                result[col] = result[col].fillna(0)
    
    # Process categorical columns
    categorical_cols = result.select_dtypes(exclude=np.number).columns
    for col in categorical_cols:
        if result[col].isna().any():
            if categorical_strategy == 'mode':
                mode_value = result[col].mode()[0]
                result[col] = result[col].fillna(mode_value)
            elif categorical_strategy == 'missing':
                result[col] = result[col].fillna('MISSING')
    
    return result 