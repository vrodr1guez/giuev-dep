"""
Check ML components installation

This script verifies that all ML components can be imported correctly,
without attempting to execute any actual functionality.
"""

def check_imports():
    """Check that all required modules can be imported"""
    import sys
    from pathlib import Path
    
    # Add the app directory to the path if needed
    app_path = Path(__file__).resolve().parent.parent.parent
    if str(app_path) not in sys.path:
        sys.path.insert(0, str(app_path))
    
    print("Checking ML module imports...")
    
    # Check base ML imports
    try:
        import numpy as np
        import pandas as pd
        import matplotlib.pyplot as plt
        import joblib
        print("✓ Base ML libraries (numpy, pandas, matplotlib, joblib)")
    except ImportError as e:
        print(f"✗ Base ML libraries: {e}")
    
    # Check forecasting modules
    try:
        from app.ml.forecasting import (
            BaseForecaster,
            ARIMAForecaster,
            ExponentialSmoothingForecaster
        )
        print("✓ Statistical forecasting components")
    except ImportError as e:
        print(f"✗ Statistical forecasting components: {e}")
    
    try:
        from app.ml.forecasting import LSTMForecaster
        print("✓ Deep learning forecasting components")
    except ImportError as e:
        print(f"✗ Deep learning forecasting components: {e}")
    
    # Check ensemble modules
    try:
        from app.ml.forecasting import EnsembleForecaster, ModelSelector
        print("✓ Ensemble forecasting components")
    except ImportError as e:
        print(f"✗ Ensemble forecasting components: {e}")
    
    # Check online learning modules
    try:
        from app.ml.forecasting import OnlineForecaster, DriftDetector
        print("✓ Online learning components")
    except ImportError as e:
        print(f"✗ Online learning components: {e}")
    
    # Check edge modules
    try:
        from app.ml.edge import ModelOptimizer, EdgeDeployer
        print("✓ Edge computing components")
    except ImportError as e:
        print(f"✗ Edge computing components: {e}")
    
    # Check federated learning
    try:
        from app.ml.federated import FederatedCoordinator, FederatedClient
        print("✓ Federated learning components")
    except ImportError as e:
        print(f"✗ Federated learning components: {e}")
    
    # Check explainability
    try:
        from app.ml.explainability import ModelExplainer
        print("✓ Explainability components")
    except ImportError as e:
        print(f"✗ Explainability components: {e}")
    
    # Check multi-task learning
    try:
        from app.ml.multitask import MultiTaskModel, SharedRepresentationModel
        print("✓ Multi-task learning components")
    except ImportError as e:
        print(f"✗ Multi-task learning components: {e}")
    
    print("\nImport checks completed.")

if __name__ == "__main__":
    check_imports() 