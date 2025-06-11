"""
Model Explainer Module

This module provides tools to explain predictions of ML models
for battery health, usage patterns and pricing in the EV charging system.
"""
import os
import sys
import json
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, List, Optional, Any, Union, Tuple
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ModelExplainer:
    """
    Provides explanation tools for ML model predictions
    
    Supports various explanation methods including:
    - SHAP (SHapley Additive exPlanations)
    - LIME (Local Interpretable Model-agnostic Explanations)
    - Feature importance
    - Partial dependence plots
    - Individual conditional expectation plots
    """
    
    def __init__(
        self,
        model,
        model_type: str = "sklearn",
        feature_names: Optional[List[str]] = None,
        target_name: Optional[str] = None,
        explanation_dir: str = 'app/ml/explainability/explanations'
    ):
        """
        Initialize model explainer
        
        Args:
            model: Trained model object
            model_type: Type of model ("sklearn", "tensorflow", "pytorch", "xgboost")
            feature_names: Names of input features
            target_name: Name of the target variable
            explanation_dir: Directory to store explanations
        """
        self.model = model
        self.model_type = model_type
        self.feature_names = feature_names
        self.target_name = target_name
        self.explanation_dir = Path(explanation_dir)
        
        # Create explanation directory if it doesn't exist
        self.explanation_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize explainers
        self._shap_explainer = None
        self._lime_explainer = None
        
        logger.info(f"Initialized ModelExplainer for {model_type} model")
    
    def explain_prediction(
        self,
        instance: Union[np.ndarray, pd.DataFrame, Dict[str, Any]],
        method: str = "shap",
        num_features: int = 10,
        save_explanation: bool = True,
        explanation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Explain a single prediction
        
        Args:
            instance: Input instance to explain
            method: Explanation method ("shap", "lime", "feature_importance")
            num_features: Number of top features to include in explanation
            save_explanation: Whether to save the explanation
            explanation_id: Identifier for the explanation
            
        Returns:
            Dictionary with explanation details
        """
        # Preprocess the instance
        instance_array = self._preprocess_instance(instance)
        
        # Generate explanation based on the selected method
        if method.lower() == "shap":
            explanation = self._explain_with_shap(instance_array, num_features)
        elif method.lower() == "lime":
            explanation = self._explain_with_lime(instance_array, num_features)
        elif method.lower() == "feature_importance":
            explanation = self._explain_with_feature_importance(instance_array)
        else:
            raise ValueError(f"Unsupported explanation method: {method}")
        
        # Add basic information to the explanation
        explanation["method"] = method
        explanation["model_type"] = self.model_type
        
        # Save explanation if requested
        if save_explanation:
            self._save_explanation(explanation, explanation_id)
        
        return explanation
    
    def explain_model(
        self,
        dataset: Optional[Union[np.ndarray, pd.DataFrame]] = None,
        method: str = "global_shap",
        num_features: int = 10,
        save_explanation: bool = True,
        explanation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate global explanations for the model
        
        Args:
            dataset: Dataset to use for explanations
            method: Explanation method ("global_shap", "permutation_importance", "pdp")
            num_features: Number of top features to include
            save_explanation: Whether to save the explanation
            explanation_id: Identifier for the explanation
            
        Returns:
            Dictionary with explanation details
        """
        if dataset is None and method != "feature_importance":
            raise ValueError("Dataset is required for global explanations")
        
        # Generate global explanation based on the selected method
        if method.lower() == "global_shap":
            explanation = self._explain_with_global_shap(dataset, num_features)
        elif method.lower() == "permutation_importance":
            explanation = self._explain_with_permutation_importance(dataset, num_features)
        elif method.lower() == "pdp":
            explanation = self._explain_with_pdp(dataset, num_features)
        elif method.lower() == "feature_importance":
            explanation = self._explain_with_model_feature_importance(num_features)
        else:
            raise ValueError(f"Unsupported explanation method: {method}")
        
        # Add basic information to the explanation
        explanation["method"] = method
        explanation["model_type"] = self.model_type
        
        # Save explanation if requested
        if save_explanation:
            self._save_explanation(explanation, explanation_id)
        
        return explanation
    
    def generate_explanation_report(
        self,
        dataset: Union[np.ndarray, pd.DataFrame],
        instances: Optional[List[Union[np.ndarray, pd.DataFrame, Dict[str, Any]]]] = None,
        methods: List[str] = ["shap", "lime", "feature_importance", "pdp"],
        report_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive explanation report for the model
        
        Args:
            dataset: Dataset to use for explanations
            instances: Specific instances to explain
            methods: List of explanation methods to use
            report_id: Identifier for the report
            
        Returns:
            Dictionary with report details and path to the saved report
        """
        report = {
            "model_type": self.model_type,
            "feature_names": self.feature_names,
            "target_name": self.target_name,
            "methods": methods,
            "global_explanations": {},
            "instance_explanations": {},
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
        # Generate global explanations
        for method in methods:
            if method in ["global_shap", "permutation_importance", "pdp", "feature_importance"]:
                logger.info(f"Generating global explanation using {method}")
                try:
                    explanation = self.explain_model(
                        dataset=dataset,
                        method=method,
                        save_explanation=False
                    )
                    report["global_explanations"][method] = explanation
                except Exception as e:
                    logger.error(f"Error generating {method} explanation: {str(e)}")
                    report["global_explanations"][method] = {"error": str(e)}
        
        # Generate explanations for specific instances
        if instances:
            for i, instance in enumerate(instances):
                instance_report = {}
                for method in methods:
                    if method in ["shap", "lime", "feature_importance"]:
                        logger.info(f"Generating {method} explanation for instance {i}")
                        try:
                            explanation = self.explain_prediction(
                                instance=instance,
                                method=method,
                                save_explanation=False
                            )
                            instance_report[method] = explanation
                        except Exception as e:
                            logger.error(f"Error generating {method} explanation for instance {i}: {str(e)}")
                            instance_report[method] = {"error": str(e)}
                
                report["instance_explanations"][f"instance_{i}"] = instance_report
        
        # Save the report
        if report_id is None:
            report_id = f"report_{pd.Timestamp.now().strftime('%Y%m%d%H%M%S')}"
        
        report_path = self.explanation_dir / f"{report_id}.json"
        
        with open(report_path, 'w') as f:
            # Convert numpy arrays and other non-serializable objects
            def json_serializer(obj):
                if isinstance(obj, (np.ndarray, np.number)):
                    return obj.tolist()
                if isinstance(obj, pd.Timestamp):
                    return obj.isoformat()
                raise TypeError(f"Type {type(obj)} not serializable")
            
            json.dump(report, f, indent=2, default=json_serializer)
        
        logger.info(f"Saved explanation report to {report_path}")
        
        # Add report path to the dictionary
        report["report_path"] = str(report_path)
        
        return report
    
    def visualize_explanation(
        self,
        explanation: Dict[str, Any],
        plot_type: str = "bar",
        save_path: Optional[str] = None,
        show_plot: bool = False
    ) -> Optional[str]:
        """
        Visualize an explanation
        
        Args:
            explanation: Explanation to visualize
            plot_type: Type of plot ("bar", "waterfall", "pdp", "heatmap")
            save_path: Path to save the visualization
            show_plot: Whether to display the plot
            
        Returns:
            Path to the saved visualization or None if not saved
        """
        plt.figure(figsize=(10, 6))
        
        method = explanation.get("method", "").lower()
        
        if plot_type == "bar" and "feature_values" in explanation and "feature_names" in explanation:
            # Bar plot of feature importance
            feature_names = explanation["feature_names"]
            feature_values = explanation["feature_values"]
            
            # Sort by absolute value
            sorted_idx = np.argsort(np.abs(feature_values))[::-1]
            
            plt.barh(
                y=np.array(feature_names)[sorted_idx],
                width=np.array(feature_values)[sorted_idx],
                color=['red' if x < 0 else 'blue' for x in np.array(feature_values)[sorted_idx]]
            )
            plt.xlabel("Feature Importance")
            plt.title(f"{method.upper()} Feature Importance")
            plt.tight_layout()
            
        elif plot_type == "waterfall" and "feature_values" in explanation and "feature_names" in explanation:
            # Waterfall plot for SHAP
            feature_names = explanation["feature_names"]
            feature_values = explanation["feature_values"]
            
            # Sort by absolute value
            sorted_idx = np.argsort(np.abs(feature_values))[::-1]
            
            # Calculate cumulative impact
            base_value = explanation.get("base_value", 0)
            cumulative = [base_value]
            for value in np.array(feature_values)[sorted_idx]:
                cumulative.append(cumulative[-1] + value)
            
            # Plot
            plt.plot(range(len(cumulative)), cumulative, 'k-o', linewidth=2)
            plt.xticks(
                range(1, len(cumulative)),
                np.array(feature_names)[sorted_idx],
                rotation=45,
                ha='right'
            )
            plt.xlabel("Features")
            plt.ylabel("Impact on prediction")
            plt.title(f"{method.upper()} Waterfall Plot")
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
        elif plot_type == "pdp" and "pdp_values" in explanation and "feature_grid" in explanation:
            # Partial dependence plot
            feature_grid = explanation["feature_grid"]
            pdp_values = explanation["pdp_values"]
            feature_name = explanation.get("feature_name", "Feature")
            
            plt.plot(feature_grid, pdp_values, 'b-', linewidth=2)
            plt.xlabel(feature_name)
            plt.ylabel("Partial Dependence")
            plt.title(f"Partial Dependence Plot for {feature_name}")
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
        elif plot_type == "heatmap" and "interaction_values" in explanation:
            # Heatmap for feature interactions
            interaction_values = np.array(explanation["interaction_values"])
            feature_names = explanation.get("feature_names", 
                                          [f"Feature {i}" for i in range(interaction_values.shape[0])])
            
            plt.imshow(interaction_values, cmap='coolwarm')
            plt.colorbar(label="Interaction Strength")
            plt.xticks(range(len(feature_names)), feature_names, rotation=45, ha='right')
            plt.yticks(range(len(feature_names)), feature_names)
            plt.title("Feature Interaction Strengths")
            plt.tight_layout()
            
        else:
            logger.warning(f"Unsupported plot type {plot_type} or missing data in explanation")
            plt.close()
            return None
        
        # Save the plot if a path is provided
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Saved visualization to {save_path}")
        
        # Show the plot if requested
        if show_plot:
            plt.show()
        else:
            plt.close()
        
        return save_path
    
    def _preprocess_instance(self, instance: Union[np.ndarray, pd.DataFrame, Dict[str, Any]]) -> np.ndarray:
        """
        Preprocess an instance for explanation
        
        Args:
            instance: Input instance
            
        Returns:
            Preprocessed instance as numpy array
        """
        if isinstance(instance, np.ndarray):
            # Ensure 2D
            if instance.ndim == 1:
                instance = instance.reshape(1, -1)
            return instance
            
        elif isinstance(instance, pd.DataFrame):
            return instance.values
            
        elif isinstance(instance, dict):
            # Convert dictionary to numpy array
            if self.feature_names:
                # Use feature names to order the values
                values = [instance.get(feature, 0) for feature in self.feature_names]
                return np.array(values).reshape(1, -1)
            else:
                # Try to convert directly
                values = list(instance.values())
                return np.array(values).reshape(1, -1)
        
        else:
            raise ValueError(f"Unsupported instance type: {type(instance)}")
    
    def _explain_with_shap(
        self,
        instance: np.ndarray,
        num_features: int
    ) -> Dict[str, Any]:
        """
        Generate SHAP explanation for a prediction
        
        Args:
            instance: Input instance
            num_features: Number of top features to include
            
        Returns:
            Dictionary with explanation details
        """
        try:
            import shap
        except ImportError:
            logger.error("SHAP package not installed. Please install with 'pip install shap'")
            raise
        
        # Initialize SHAP explainer if needed
        if self._shap_explainer is None:
            if self.model_type == "sklearn":
                self._shap_explainer = shap.Explainer(self.model)
            elif self.model_type == "xgboost":
                self._shap_explainer = shap.TreeExplainer(self.model)
            elif self.model_type == "tensorflow":
                self._shap_explainer = shap.DeepExplainer(self.model, shap.sample(self.X_train, 100))
            elif self.model_type == "pytorch":
                self._shap_explainer = shap.DeepExplainer(self.model, torch.from_numpy(shap.sample(self.X_train, 100)))
            else:
                self._shap_explainer = shap.Explainer(self.model)
        
        # Get SHAP values
        shap_values = self._shap_explainer(instance)
        
        # Get the prediction
        if hasattr(self.model, 'predict'):
            prediction = self.model.predict(instance)[0]
        else:
            # Use generic prediction for models without a predict method
            prediction = None
        
        # Extract base value (expected value)
        if hasattr(shap_values, "base_values"):
            base_value = shap_values.base_values[0]
        else:
            base_value = self._shap_explainer.expected_value
        
        # Get feature values
        if isinstance(shap_values, np.ndarray):
            feature_values = shap_values[0]
        else:
            feature_values = shap_values.values[0]
        
        # Sort features by importance
        if feature_values.ndim > 1:
            # For multi-output models, take mean across outputs
            importance = np.abs(feature_values).mean(axis=1)
        else:
            importance = np.abs(feature_values)
        
        # Get indices of top features
        top_indices = np.argsort(importance)[::-1][:num_features]
        
        # Get feature names
        if self.feature_names:
            feature_names = [self.feature_names[i] for i in top_indices]
        else:
            feature_names = [f"Feature_{i}" for i in top_indices]
        
        # Prepare feature values for explanation
        if feature_values.ndim > 1:
            # For multi-output models
            top_values = [feature_values[i].mean() for i in top_indices]
        else:
            top_values = [feature_values[i] for i in top_indices]
        
        # Create explanation dictionary
        explanation = {
            "prediction": prediction,
            "base_value": base_value,
            "feature_names": feature_names,
            "feature_values": top_values,
            "feature_importances": importance[top_indices].tolist(),
            "instance": instance.tolist(),
            "method": "shap"
        }
        
        return explanation
    
    def _explain_with_lime(
        self,
        instance: np.ndarray,
        num_features: int
    ) -> Dict[str, Any]:
        """
        Generate LIME explanation for a prediction
        
        Args:
            instance: Input instance
            num_features: Number of top features to include
            
        Returns:
            Dictionary with explanation details
        """
        try:
            from lime import lime_tabular
        except ImportError:
            logger.error("LIME package not installed. Please install with 'pip install lime'")
            raise
        
        # Initialize LIME explainer if needed
        if self._lime_explainer is None:
            if hasattr(self, 'X_train'):
                # Use training data if available
                self._lime_explainer = lime_tabular.LimeTabularExplainer(
                    self.X_train,
                    feature_names=self.feature_names,
                    class_names=[self.target_name] if self.target_name else None,
                    mode='regression' if hasattr(self.model, 'predict') else 'classification'
                )
            else:
                # Create a dummy explainer without training data
                self._lime_explainer = lime_tabular.LimeTabularExplainer(
                    np.zeros((1, instance.shape[1])),
                    feature_names=self.feature_names,
                    class_names=[self.target_name] if self.target_name else None,
                    mode='regression' if hasattr(self.model, 'predict') else 'classification'
                )
        
        # Define prediction function for LIME
        def predict_fn(x):
            return self.model.predict(x)
        
        # Generate LIME explanation
        lime_exp = self._lime_explainer.explain_instance(
            instance[0],
            predict_fn,
            num_features=num_features
        )
        
        # Extract feature importance
        feature_importance = lime_exp.as_list()
        
        # Get the prediction
        if hasattr(self.model, 'predict'):
            prediction = self.model.predict(instance)[0]
        else:
            prediction = None
        
        # Extract feature names and values
        feature_names = [item[0] for item in feature_importance]
        feature_values = [item[1] for item in feature_importance]
        
        # Create explanation dictionary
        explanation = {
            "prediction": prediction,
            "feature_names": feature_names,
            "feature_values": feature_values,
            "instance": instance.tolist(),
            "method": "lime"
        }
        
        return explanation
    
    def _explain_with_feature_importance(
        self,
        instance: np.ndarray
    ) -> Dict[str, Any]:
        """
        Generate feature importance explanation for a prediction
        
        Args:
            instance: Input instance
            
        Returns:
            Dictionary with explanation details
        """
        # This method provides a basic feature importance
        # by computing the contribution of each feature
        
        # Get the prediction
        if hasattr(self.model, 'predict'):
            prediction = self.model.predict(instance)[0]
        else:
            prediction = None
        
        # Get baseline prediction
        baseline = np.zeros_like(instance)
        if hasattr(self.model, 'predict'):
            baseline_prediction = self.model.predict(baseline)[0]
        else:
            baseline_prediction = 0
        
        # Calculate feature importance
        feature_values = []
        for i in range(instance.shape[1]):
            # Create a copy of the instance with this feature set to 0
            masked_instance = instance.copy()
            masked_instance[0, i] = 0
            
            # Get prediction with this feature masked
            if hasattr(self.model, 'predict'):
                masked_prediction = self.model.predict(masked_instance)[0]
            else:
                masked_prediction = 0
            
            # Calculate importance as the difference in predictions
            importance = prediction - masked_prediction
            feature_values.append(importance)
        
        # Get feature names
        if self.feature_names:
            feature_names = self.feature_names
        else:
            feature_names = [f"Feature_{i}" for i in range(instance.shape[1])]
        
        # Create explanation dictionary
        explanation = {
            "prediction": prediction,
            "baseline_prediction": baseline_prediction,
            "feature_names": feature_names,
            "feature_values": feature_values,
            "instance": instance.tolist(),
            "method": "feature_importance"
        }
        
        return explanation
    
    def _explain_with_global_shap(
        self,
        dataset: Union[np.ndarray, pd.DataFrame],
        num_features: int
    ) -> Dict[str, Any]:
        """
        Generate global SHAP explanations
        
        Args:
            dataset: Dataset to explain
            num_features: Number of top features to include
            
        Returns:
            Dictionary with explanation details
        """
        try:
            import shap
        except ImportError:
            logger.error("SHAP package not installed. Please install with 'pip install shap'")
            raise
        
        # Convert dataset to numpy array if needed
        if isinstance(dataset, pd.DataFrame):
            X = dataset.values
        else:
            X = dataset
        
        # Initialize SHAP explainer if needed
        if self._shap_explainer is None:
            if self.model_type == "sklearn":
                self._shap_explainer = shap.Explainer(self.model)
            elif self.model_type == "xgboost":
                self._shap_explainer = shap.TreeExplainer(self.model)
            elif self.model_type == "tensorflow":
                self._shap_explainer = shap.DeepExplainer(self.model, shap.sample(X, 100))
            elif self.model_type == "pytorch":
                self._shap_explainer = shap.DeepExplainer(self.model, torch.from_numpy(shap.sample(X, 100)))
            else:
                self._shap_explainer = shap.Explainer(self.model)
        
        # Sample the dataset if it's large
        if X.shape[0] > 100:
            sample_indices = np.random.choice(X.shape[0], 100, replace=False)
            X_sample = X[sample_indices]
        else:
            X_sample = X
        
        # Get SHAP values
        shap_values = self._shap_explainer(X_sample)
        
        # Extract base value (expected value)
        if hasattr(shap_values, "base_values"):
            base_value = shap_values.base_values[0]
        else:
            base_value = self._shap_explainer.expected_value
        
        # Get feature values
        if isinstance(shap_values, np.ndarray):
            feature_values = shap_values
        else:
            feature_values = shap_values.values
        
        # Calculate global importance
        global_importance = np.abs(feature_values).mean(axis=0)
        
        # Get indices of top features
        if global_importance.ndim > 1:
            # For multi-output models
            importance = global_importance.mean(axis=1)
        else:
            importance = global_importance
        
        top_indices = np.argsort(importance)[::-1][:num_features]
        
        # Get feature names
        if self.feature_names:
            feature_names = [self.feature_names[i] for i in top_indices]
        else:
            feature_names = [f"Feature_{i}" for i in top_indices]
        
        # Get feature importance values
        if global_importance.ndim > 1:
            top_values = [global_importance[i].mean() for i in top_indices]
        else:
            top_values = [global_importance[i] for i in top_indices]
        
        # Calculate feature interactions if possible
        try:
            # Sample even smaller for interactions (expensive computation)
            if X_sample.shape[0] > 20:
                sample_indices = np.random.choice(X_sample.shape[0], 20, replace=False)
                X_interaction = X_sample[sample_indices]
            else:
                X_interaction = X_sample
            
            # Get interaction values
            interaction_values = self._shap_explainer.shap_interaction_values(X_interaction)
            
            # Average across samples
            interaction_values = np.abs(interaction_values).mean(axis=0)
            
            # For multi-output models, take mean across outputs
            if interaction_values.ndim > 2:
                interaction_values = interaction_values.mean(axis=2)
        except:
            # Interactions not supported for this model
            interaction_values = None
        
        # Create explanation dictionary
        explanation = {
            "base_value": base_value,
            "feature_names": feature_names,
            "feature_values": top_values,
            "feature_importances": importance[top_indices].tolist(),
            "method": "global_shap"
        }
        
        # Add interaction values if available
        if interaction_values is not None:
            # Only include top features in interaction matrix
            interaction_matrix = np.zeros((len(top_indices), len(top_indices)))
            for i, idx1 in enumerate(top_indices):
                for j, idx2 in enumerate(top_indices):
                    interaction_matrix[i, j] = interaction_values[idx1, idx2]
            
            explanation["interaction_values"] = interaction_matrix.tolist()
        
        return explanation
    
    def _explain_with_permutation_importance(
        self,
        dataset: Union[np.ndarray, pd.DataFrame],
        num_features: int
    ) -> Dict[str, Any]:
        """
        Generate permutation importance explanations
        
        Args:
            dataset: Dataset to explain
            num_features: Number of top features to include
            
        Returns:
            Dictionary with explanation details
        """
        try:
            from sklearn.inspection import permutation_importance
        except ImportError:
            logger.error("scikit-learn not installed properly. Please install with 'pip install scikit-learn'")
            raise
        
        # Convert dataset to numpy array if needed
        if isinstance(dataset, pd.DataFrame):
            X = dataset.values
        else:
            X = dataset
        
        # Get targets if available, otherwise use a dummy target
        if hasattr(self, 'y_train'):
            y = self.y_train
        else:
            # Create dummy targets
            y = np.zeros(X.shape[0])
        
        # Compute permutation importance
        result = permutation_importance(
            self.model, X, y,
            n_repeats=10,
            random_state=42
        )
        
        # Get feature importance values
        importance = result.importances_mean
        
        # Get indices of top features
        top_indices = np.argsort(importance)[::-1][:num_features]
        
        # Get feature names
        if self.feature_names:
            feature_names = [self.feature_names[i] for i in top_indices]
        else:
            feature_names = [f"Feature_{i}" for i in top_indices]
        
        # Get feature importance values
        top_values = [importance[i] for i in top_indices]
        
        # Create explanation dictionary
        explanation = {
            "feature_names": feature_names,
            "feature_values": top_values,
            "feature_importances": importance[top_indices].tolist(),
            "method": "permutation_importance"
        }
        
        return explanation
    
    def _explain_with_pdp(
        self,
        dataset: Union[np.ndarray, pd.DataFrame],
        num_features: int
    ) -> Dict[str, Any]:
        """
        Generate partial dependence plot explanations
        
        Args:
            dataset: Dataset to explain
            num_features: Number of features to include
            
        Returns:
            Dictionary with explanation details
        """
        try:
            from sklearn.inspection import partial_dependence
        except ImportError:
            logger.error("scikit-learn not installed properly. Please install with 'pip install scikit-learn'")
            raise
        
        # Convert dataset to numpy array if needed
        if isinstance(dataset, pd.DataFrame):
            X = dataset
            feature_names = X.columns.tolist()
        else:
            X = dataset
            feature_names = self.feature_names if self.feature_names else [f"Feature_{i}" for i in range(X.shape[1])]
        
        # Get feature importance to select top features
        if hasattr(self.model, 'feature_importances_'):
            importance = self.model.feature_importances_
        else:
            # Compute permutation importance
            if hasattr(self, 'y_train'):
                y = self.y_train
            else:
                y = np.zeros(X.shape[0])
                
            from sklearn.inspection import permutation_importance
            result = permutation_importance(
                self.model, X, y,
                n_repeats=5,
                random_state=42
            )
            importance = result.importances_mean
        
        # Get indices of top features
        top_indices = np.argsort(importance)[::-1][:num_features]
        
        # Get feature names for top features
        top_feature_names = [feature_names[i] for i in top_indices]
        
        # Compute partial dependence for each top feature
        pdp_results = {}
        
        for i, idx in enumerate(top_indices):
            feature_idx = int(idx)  # Ensure it's an integer
            
            # Compute partial dependence
            pdp = partial_dependence(
                self.model, X, [feature_idx], kind="average", grid_resolution=20
            )
            
            # Get feature grid and PDP values
            feature_grid = pdp["values"][0]
            pdp_values = pdp["average"][0]
            
            pdp_results[top_feature_names[i]] = {
                "feature_idx": feature_idx,
                "feature_grid": feature_grid.tolist(),
                "pdp_values": pdp_values.tolist()
            }
        
        # Create explanation dictionary
        explanation = {
            "feature_names": top_feature_names,
            "feature_importances": importance[top_indices].tolist(),
            "pdp_results": pdp_results,
            "method": "pdp"
        }
        
        return explanation
    
    def _explain_with_model_feature_importance(
        self,
        num_features: int
    ) -> Dict[str, Any]:
        """
        Extract built-in feature importance from the model
        
        Args:
            num_features: Number of top features to include
            
        Returns:
            Dictionary with explanation details
        """
        # Check if the model has built-in feature importance
        if hasattr(self.model, 'feature_importances_'):
            # Tree-based models
            importance = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            # Linear models
            if self.model.coef_.ndim > 1:
                # Multiclass
                importance = np.abs(self.model.coef_).mean(axis=0)
            else:
                importance = np.abs(self.model.coef_)
        else:
            raise ValueError("Model does not have built-in feature importance")
        
        # Get indices of top features
        top_indices = np.argsort(importance)[::-1][:num_features]
        
        # Get feature names
        if self.feature_names:
            feature_names = [self.feature_names[i] for i in top_indices]
        else:
            feature_names = [f"Feature_{i}" for i in top_indices]
        
        # Get feature importance values
        top_values = [importance[i] for i in top_indices]
        
        # Create explanation dictionary
        explanation = {
            "feature_names": feature_names,
            "feature_values": top_values,
            "feature_importances": importance[top_indices].tolist(),
            "method": "feature_importance"
        }
        
        return explanation
    
    def _save_explanation(
        self,
        explanation: Dict[str, Any],
        explanation_id: Optional[str] = None
    ) -> str:
        """
        Save an explanation to disk
        
        Args:
            explanation: Explanation to save
            explanation_id: Identifier for the explanation
            
        Returns:
            Path to the saved explanation
        """
        if explanation_id is None:
            explanation_id = f"explanation_{pd.Timestamp.now().strftime('%Y%m%d%H%M%S')}"
        
        explanation_path = self.explanation_dir / f"{explanation_id}.json"
        
        with open(explanation_path, 'w') as f:
            # Convert numpy arrays and other non-serializable objects
            def json_serializer(obj):
                if isinstance(obj, (np.ndarray, np.number)):
                    return obj.tolist()
                if isinstance(obj, pd.Timestamp):
                    return obj.isoformat()
                raise TypeError(f"Type {type(obj)} not serializable")
            
            json.dump(explanation, f, indent=2, default=json_serializer)
        
        logger.info(f"Saved explanation to {explanation_path}")
        
        return str(explanation_path)


# Example usage
def main():
    """Example of using the model explainer"""
    # Create a dummy model for demonstration
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.datasets import make_regression
    
    # Generate synthetic data
    X, y = make_regression(n_samples=100, n_features=10, random_state=42)
    
    # Create feature names
    feature_names = [f"Feature_{i}" for i in range(X.shape[1])]
    
    # Create and train a model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Create explainer
    explainer = ModelExplainer(
        model=model,
        model_type="sklearn",
        feature_names=feature_names,
        target_name="Target"
    )
    
    # Set training data (needed for some explanation methods)
    explainer.X_train = X
    explainer.y_train = y
    
    # Generate explanation for a single instance
    instance = X[0:1]  # First instance
    explanation = explainer.explain_prediction(instance, method="shap")
    
    print(f"Top features for instance prediction: {explanation['feature_names']}")
    print(f"Feature importance values: {explanation['feature_values']}")
    
    # Generate global model explanation
    global_explanation = explainer.explain_model(X, method="global_shap")
    
    print(f"Top features for model: {global_explanation['feature_names']}")
    print(f"Global feature importance: {global_explanation['feature_values']}")
    
    # Visualize explanation
    explainer.visualize_explanation(
        explanation,
        plot_type="bar",
        save_path="shap_explanation.png",
        show_plot=False
    )
    
    print("Explanation visualized and saved to 'shap_explanation.png'")


if __name__ == "__main__":
    main() 