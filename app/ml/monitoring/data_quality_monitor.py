"""
Data Quality Monitoring System
Ensures data integrity for ML models in the EV Charging Infrastructure
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class QualityCheckType(Enum):
    """Types of data quality checks"""
    COMPLETENESS = "completeness"
    CONSISTENCY = "consistency"
    VALIDITY = "validity"
    TIMELINESS = "timeliness"
    ACCURACY = "accuracy"
    UNIQUENESS = "uniqueness"

@dataclass
class QualityIssue:
    """Represents a data quality issue"""
    check_type: QualityCheckType
    severity: str  # 'critical', 'warning', 'info'
    column: Optional[str]
    description: str
    affected_rows: int
    timestamp: datetime

class DataQualityMonitor:
    """
    Comprehensive data quality monitoring for EV charging data
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or self._get_default_config()
        self.issues: List[QualityIssue] = []
        
    def _get_default_config(self) -> Dict:
        """Default configuration for quality checks"""
        return {
            'missing_threshold': 0.05,  # 5% missing data threshold
            'outlier_std': 3,  # 3 standard deviations for outlier detection
            'staleness_hours': 24,  # Data older than 24 hours is stale
            'battery_health_range': (0, 100),
            'temperature_range': (-40, 80),  # Celsius
            'charge_rate_range': (0, 350),  # kW
            'voltage_range': (200, 800),  # V
        }
    
    def run_all_checks(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Run all data quality checks"""
        logger.info(f"Running data quality checks on {len(df)} rows")
        
        self.issues = []  # Reset issues
        
        # Run individual checks
        completeness_score = self.check_completeness(df)
        consistency_score = self.check_consistency(df)
        validity_score = self.check_validity(df)
        timeliness_score = self.check_timeliness(df)
        uniqueness_score = self.check_uniqueness(df)
        
        # Calculate overall quality score
        overall_score = np.mean([
            completeness_score,
            consistency_score,
            validity_score,
            timeliness_score,
            uniqueness_score
        ])
        
        # Generate report
        report = {
            'timestamp': datetime.now(),
            'rows_checked': len(df),
            'overall_score': overall_score,
            'scores': {
                'completeness': completeness_score,
                'consistency': consistency_score,
                'validity': validity_score,
                'timeliness': timeliness_score,
                'uniqueness': uniqueness_score
            },
            'issues': self.issues,
            'critical_issues': [i for i in self.issues if i.severity == 'critical']
        }
        
        logger.info(f"Data quality check complete. Overall score: {overall_score:.2%}")
        return report
    
    def check_completeness(self, df: pd.DataFrame) -> float:
        """Check for missing values"""
        missing_counts = df.isnull().sum()
        total_values = len(df) * len(df.columns)
        missing_ratio = missing_counts.sum() / total_values
        
        # Check each column
        for column, missing_count in missing_counts.items():
            if missing_count > 0:
                missing_pct = missing_count / len(df)
                
                if missing_pct > self.config['missing_threshold']:
                    severity = 'critical' if missing_pct > 0.2 else 'warning'
                    self.issues.append(QualityIssue(
                        check_type=QualityCheckType.COMPLETENESS,
                        severity=severity,
                        column=column,
                        description=f"{missing_pct:.1%} missing values in {column}",
                        affected_rows=missing_count,
                        timestamp=datetime.now()
                    ))
        
        return 1 - missing_ratio
    
    def check_consistency(self, df: pd.DataFrame) -> float:
        """Check for logical inconsistencies"""
        inconsistencies = 0
        total_checks = 0
        
        # Battery health should decrease over time (for same vehicle)
        if 'vehicle_id' in df.columns and 'state_of_health' in df.columns and 'timestamp' in df.columns:
            for vehicle_id in df['vehicle_id'].unique():
                vehicle_data = df[df['vehicle_id'] == vehicle_id].sort_values('timestamp')
                if len(vehicle_data) > 1:
                    soh_diff = vehicle_data['state_of_health'].diff()
                    increasing_soh = (soh_diff > 5).sum()  # Allow small increases due to measurement error
                    if increasing_soh > 0:
                        inconsistencies += increasing_soh
                        self.issues.append(QualityIssue(
                            check_type=QualityCheckType.CONSISTENCY,
                            severity='warning',
                            column='state_of_health',
                            description=f"Battery health increased unexpectedly for vehicle {vehicle_id}",
                            affected_rows=increasing_soh,
                            timestamp=datetime.now()
                        ))
                total_checks += len(vehicle_data) - 1
        
        # Charge cycles should only increase
        if 'charge_cycles' in df.columns:
            cycles_diff = df.groupby('vehicle_id')['charge_cycles'].diff()
            decreasing_cycles = (cycles_diff < 0).sum()
            if decreasing_cycles > 0:
                inconsistencies += decreasing_cycles
                self.issues.append(QualityIssue(
                    check_type=QualityCheckType.CONSISTENCY,
                    severity='critical',
                    column='charge_cycles',
                    description="Charge cycles decreased (should only increase)",
                    affected_rows=decreasing_cycles,
                    timestamp=datetime.now()
                ))
            total_checks += len(cycles_diff.dropna())
        
        return 1 - (inconsistencies / max(total_checks, 1))
    
    def check_validity(self, df: pd.DataFrame) -> float:
        """Check if values are within valid ranges"""
        invalid_count = 0
        total_checks = 0
        
        # Define range checks
        range_checks = {
            'state_of_health': self.config['battery_health_range'],
            'battery_temp': self.config['temperature_range'],
            'ambient_temp': self.config['temperature_range'],
            'voltage': self.config['voltage_range'],
            'charge_rate': self.config['charge_rate_range'],
            'state_of_charge': (0, 100)
        }
        
        for column, (min_val, max_val) in range_checks.items():
            if column in df.columns:
                out_of_range = df[(df[column] < min_val) | (df[column] > max_val)]
                if len(out_of_range) > 0:
                    invalid_count += len(out_of_range)
                    self.issues.append(QualityIssue(
                        check_type=QualityCheckType.VALIDITY,
                        severity='critical',
                        column=column,
                        description=f"Values outside valid range [{min_val}, {max_val}]",
                        affected_rows=len(out_of_range),
                        timestamp=datetime.now()
                    ))
                total_checks += len(df[column].dropna())
        
        # Check for statistical outliers
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        for column in numeric_columns:
            if column not in range_checks:  # Don't double-check
                mean = df[column].mean()
                std = df[column].std()
                outliers = df[np.abs(df[column] - mean) > self.config['outlier_std'] * std]
                if len(outliers) > 0:
                    invalid_count += len(outliers)
                    self.issues.append(QualityIssue(
                        check_type=QualityCheckType.VALIDITY,
                        severity='warning',
                        column=column,
                        description=f"Statistical outliers detected (>{self.config['outlier_std']} std)",
                        affected_rows=len(outliers),
                        timestamp=datetime.now()
                    ))
                total_checks += len(df[column].dropna())
        
        return 1 - (invalid_count / max(total_checks, 1))
    
    def check_timeliness(self, df: pd.DataFrame) -> float:
        """Check data freshness"""
        if 'timestamp' not in df.columns:
            return 1.0  # Can't check without timestamp
        
        current_time = datetime.now()
        stale_threshold = timedelta(hours=self.config['staleness_hours'])
        
        # Convert timestamp column to datetime if needed
        if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        stale_data = df[current_time - df['timestamp'] > stale_threshold]
        stale_ratio = len(stale_data) / len(df)
        
        if stale_ratio > 0:
            severity = 'critical' if stale_ratio > 0.5 else 'warning'
            self.issues.append(QualityIssue(
                check_type=QualityCheckType.TIMELINESS,
                severity=severity,
                column='timestamp',
                description=f"{stale_ratio:.1%} of data is older than {self.config['staleness_hours']} hours",
                affected_rows=len(stale_data),
                timestamp=datetime.now()
            ))
        
        return 1 - stale_ratio
    
    def check_uniqueness(self, df: pd.DataFrame) -> float:
        """Check for duplicate records"""
        # Check for complete duplicates
        duplicates = df.duplicated()
        duplicate_count = duplicates.sum()
        
        if duplicate_count > 0:
            self.issues.append(QualityIssue(
                check_type=QualityCheckType.UNIQUENESS,
                severity='warning',
                column=None,
                description=f"Found {duplicate_count} duplicate rows",
                affected_rows=duplicate_count,
                timestamp=datetime.now()
            ))
        
        # Check for duplicate readings at same timestamp for same vehicle
        if all(col in df.columns for col in ['vehicle_id', 'timestamp']):
            duplicate_readings = df.duplicated(subset=['vehicle_id', 'timestamp'])
            dup_reading_count = duplicate_readings.sum()
            
            if dup_reading_count > 0:
                self.issues.append(QualityIssue(
                    check_type=QualityCheckType.UNIQUENESS,
                    severity='critical',
                    column='vehicle_id,timestamp',
                    description=f"Multiple readings for same vehicle at same time",
                    affected_rows=dup_reading_count,
                    timestamp=datetime.now()
                ))
        
        total_duplicates = duplicate_count + dup_reading_count
        return 1 - (total_duplicates / len(df))
    
    def get_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on quality issues"""
        recommendations = []
        
        # Analyze critical issues
        critical_issues = report['critical_issues']
        
        if any(i.check_type == QualityCheckType.COMPLETENESS for i in critical_issues):
            recommendations.append("Implement data imputation strategy for missing values")
            recommendations.append("Review data collection pipeline for gaps")
        
        if any(i.check_type == QualityCheckType.VALIDITY for i in critical_issues):
            recommendations.append("Add input validation at data ingestion point")
            recommendations.append("Review sensor calibration for out-of-range values")
        
        if any(i.check_type == QualityCheckType.CONSISTENCY for i in critical_issues):
            recommendations.append("Implement business rule validation in data pipeline")
            recommendations.append("Add data lineage tracking")
        
        if any(i.check_type == QualityCheckType.TIMELINESS for i in critical_issues):
            recommendations.append("Review data transmission frequency")
            recommendations.append("Implement real-time data streaming")
        
        if report['overall_score'] < 0.8:
            recommendations.append("Consider implementing automated data quality alerts")
            recommendations.append("Schedule regular data quality reviews")
        
        return recommendations

# Example usage
if __name__ == "__main__":
    # Generate sample data
    sample_data = pd.DataFrame({
        'vehicle_id': ['EV001'] * 100,
        'timestamp': pd.date_range(start='2024-01-01', periods=100, freq='H'),
        'state_of_health': np.linspace(100, 95, 100) + np.random.normal(0, 0.5, 100),
        'battery_temp': np.random.normal(25, 5, 100),
        'charge_cycles': np.cumsum(np.random.poisson(0.1, 100)),
        'voltage': np.random.normal(400, 10, 100),
        'state_of_charge': np.random.uniform(20, 90, 100)
    })
    
    # Add some quality issues for testing
    sample_data.loc[10:15, 'battery_temp'] = np.nan  # Missing values
    sample_data.loc[20, 'state_of_health'] = 110  # Out of range
    sample_data.loc[30:32, 'charge_cycles'] = 50  # Decreasing cycles
    
    # Run quality checks
    monitor = DataQualityMonitor()
    report = monitor.run_all_checks(sample_data)
    
    # Print results
    print(f"Overall Quality Score: {report['overall_score']:.2%}")
    print(f"Total Issues Found: {len(report['issues'])}")
    print(f"Critical Issues: {len(report['critical_issues'])}")
    
    # Get recommendations
    recommendations = monitor.get_recommendations(report)
    print("\nRecommendations:")
    for rec in recommendations:
        print(f"- {rec}") 