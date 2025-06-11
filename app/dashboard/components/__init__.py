"""
Dashboard Components Package

This package contains visualization components for the ML dashboard.
"""
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    # Use relative imports to make the components available when imported as a package
    from .forecast_dashboard import display_forecast_dashboard
    from .enhanced_forecast_dashboard import display_enhanced_forecast_dashboard
    from .advanced_ml_dashboard import display_advanced_ml_dashboard
    
    logger.info("Dashboard components successfully imported")
    
    __all__ = [
        'display_forecast_dashboard',
        'display_enhanced_forecast_dashboard',
        'display_advanced_ml_dashboard'
    ]
    
except ImportError as e:
    logger.error(f"Failed to import dashboard components: {e}")
    logger.info("Components will need to be imported directly from their modules") 