import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any
from datetime import datetime, timedelta
import joblib
from pathlib import Path


class BatteryDegradationModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = Path("models/battery_degradation_model.joblib")
        self.scaler_path = Path("models/battery_degradation_scaler.joblib")
        self._load_or_create_model()

    def _load_or_create_model(self):
        """Load existing model or create a new one if not exists."""
        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
        except FileNotFoundError:
            self.model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=3,
                random_state=42
            )

    def _prepare_features(
            self, health_reports: List[Dict[str, Any]]) -> np.ndarray:
        """Prepare features from battery health reports."""
        features = []
        for report in health_reports:
            feature_vector = [
                report["state_of_health_percent"],
                report["estimated_remaining_capacity_kwh"],
                report["cycle_count_estimate"],
                report["average_cell_temperature_celsius"],
                # Days since report
                (datetime.now() - report["report_date"]).days
            ]
            features.append(feature_vector)
        return np.array(features)

    def train(
            self, training_data: List[Dict[str, Any]], save_model: bool = True):
        """Train the model on historical battery health data."""
        if not training_data:
            raise ValueError("No training data provided")

        X = self._prepare_features(training_data)
        y = np.array([d["state_of_health_percent"] for d in training_data[1:]] +
                     [training_data[-1]["state_of_health_percent"]])  # Target is next SoH

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)

        if save_model:
            self.model_path.parent.mkdir(exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)

    def predict_degradation(
        self,
        recent_reports: List[Dict[str, Any]],
        prediction_days: int = 365
    ) -> Dict[str, Any]:
        """
        Predict battery degradation based on recent health reports.

        Args:
            recent_reports: List of recent battery health reports
            prediction_days: Number of days to predict into the future

        Returns:
            Dictionary containing prediction results
        """
        if not recent_reports or len(recent_reports) < 3:
            return {
                "prediction_available": False,
                "reason": "Insufficient historical data (minimum 3 reports required)"}

        try:
            # Prepare features
            X = self._prepare_features(recent_reports)
            X_scaled = self.scaler.transform(X)

            # Get current SoH
            current_soh = recent_reports[-1]["state_of_health_percent"]

            # Predict future SoH
            predicted_soh = self.model.predict(X_scaled)[-1]

            # Calculate confidence based on prediction variance
            predictions = []
            for _ in range(10):
                sample_idx = np.random.choice(
                    len(X_scaled), size=len(X_scaled), replace=True)
                pred = self.model.predict(X_scaled[sample_idx])[-1]
                predictions.append(pred)

            confidence_std = np.std(predictions)
            confidence_level = "high" if confidence_std < 2 else "medium" if confidence_std < 5 else "low"

            return {
                "prediction_available": True,
                "current_soh": current_soh,
                "predicted_soh": max(0, predicted_soh),  # Ensure non-negative
                "confidence_level": confidence_level,
                "confidence_std": confidence_std,
                "prediction_timestamp": datetime.utcnow(),
                "prediction_target_date": datetime.utcnow() + timedelta(days=prediction_days),
                "num_reports_used": len(recent_reports),
                "model_version": "1.0.0"
            }

        except Exception as e:
            return {
                "prediction_available": False,
                "reason": f"Prediction failed: {str(e)}"
            }

    def get_degradation_factors(
            self, health_reports: List[Dict[str, Any]]) -> Dict[str, float]:
        """Analyze factors contributing to battery degradation."""
        if not self.model or len(health_reports) < 3:
            return {}

        X = self._prepare_features(health_reports)
        X_scaled = self.scaler.transform(X)

        # Get feature importance scores
        importance_scores = self.model.feature_importances_

        return {
            "soh_history": importance_scores[0],
            "capacity": importance_scores[1],
            "cycle_count": importance_scores[2],
            "temperature": importance_scores[3],
            "age": importance_scores[4]
        }

    def predict(self, X: pd.DataFrame) -> List[float]:
        """Predict battery degradation for new data."""
        # Ensure X is a DataFrame and has the correct columns
        if not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X, columns=self.feature_names_)
        else:
            X = X[self.feature_names_]

        # Preprocess data (e.g., scaling)
        # X_scaled = self.preprocessor.transform(X) # X_scaled is unused, using X directly as per existing logic
        predictions = self.model.predict(X)
        return predictions.tolist()


battery_degradation_model = BatteryDegradationModel()
