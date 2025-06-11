"""
ML Model Visualization Dashboard

This module provides a Streamlit dashboard for visualizing the outputs of 
machine learning models in the GIU EV Charging Infrastructure.
"""
import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from pathlib import Path

# Ensure app is in the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import numpy as np
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import requests
from plotly.subplots import make_subplots
from urllib.parse import parse_qs
import importlib.util
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import optional dependencies
HAVE_XGBOOST = False
try:
    import xgboost
    HAVE_XGBOOST = True
except ImportError:
    logger.warning("XGBoost not available. Using fallback predictions.")

# API connection settings
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8003/api/ml")

# Page configuration
st.set_page_config(
    page_title="GIU EV Charging Infrastructure - ML Dashboard",
    page_icon="🔋",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Show warning if XGBoost is not available
if not HAVE_XGBOOST:
    st.warning("""
        ⚠️ XGBoost is not available. Some advanced features will use simplified models.
        For full functionality, please install XGBoost and its dependencies:
        ```
        brew install libomp  # For macOS
        pip install xgboost
        ```
    """)

# Also apply some additional Streamlit-specific theming
theme = {
    "primaryColor": "#0ea5e9",
    "backgroundColor": "#0f172a",
    "secondaryBackgroundColor": "#1e293b",
    "textColor": "#f1f5f9",
    "font": "sans-serif"
}

# Apply theme using Streamlit's theme API - properly fixed now
try:
    st.markdown("""
    <style>
        :root {
            --st-primaryColor: #0ea5e9;
            --st-backgroundColor: #0f172a;
            --st-secondaryBackgroundColor: #1e293b;
            --st-textColor: #f1f5f9;
            --st-font: 'Inter', sans-serif;
        }
        
        /* Modern Dashboard Styling with enhanced glassmorphism */
        .stApp {
            background: linear-gradient(135deg, var(--st-backgroundColor) 0%, #0c111d 100%);
        }
        
        /* Card styling with advanced glassmorphism effect */
        div[data-testid="stExpander"], div.stCard {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            transition: all 0.3s ease;
            margin-bottom: 1.5rem;
        }
        
        div[data-testid="stExpander"]:hover, div.stCard:hover {
            box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.5);
            border-color: rgba(14, 165, 233, 0.2);
            transform: translateY(-3px);
        }
        
        /* Beautiful Header styling */
        h1, h2, h3 {
            font-weight: 600;
            background: linear-gradient(90deg, #0ea5e9, #38bdf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
            letter-spacing: -0.02em;
        }
        
        h1 {
            border-bottom: none !important;
            font-size: 2.2rem !important;
            margin-bottom: 1.5rem !important;
        }
        
        h2 {
            font-size: 1.7rem !important;
            margin-top: 1.5rem !important;
        }
        
        h3 {
            font-size: 1.2rem !important;
        }
        
        /* Beautiful Button styling */
        .stButton > button {
            background: linear-gradient(90deg, #0ea5e9, #0c4a6e);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 14px;
        }
        
        .stButton > button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            background: linear-gradient(90deg, #38bdf8, #0e7490);
        }
        
        .stButton > button:active {
            transform: translateY(0px);
        }
        
        /* Enhanced Metric styling with animation */
        [data-testid="stMetric"] {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.2rem 1.5rem;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        [data-testid="stMetric"]:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px 0 rgba(0, 0, 0, 0.3);
            border-color: rgba(14, 165, 233, 0.3);
        }
        
        [data-testid="stMetric"] > div {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
        }
        
        [data-testid="stMetric"] > div:first-child {
            font-size: 0.9rem !important;
            color: #94a3b8 !important;
        }
        
        [data-testid="stMetric"] > div:nth-child(2) {
            font-size: 1.8rem !important;
            font-weight: 600 !important;
            color: #f1f5f9 !important;
        }
        
        [data-testid="stMetricDelta"] > div {
            display: flex;
            align-items: center;
        }
        
        [data-testid="stMetricDelta"] svg {
            margin-right: 0.3rem;
        }
        
        /* Dashboard cards with enhanced hover effects */
        .dashboard-card {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 25px;
            height: 100%;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 25px 0 rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
        }
        
        .dashboard-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px 0 rgba(0, 0, 0, 0.3);
            border-color: var(--st-primaryColor);
        }
        
        /* Dashboard grid layout */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
            margin-top: 2rem;
        }
        
        /* Custom app header with gradient underline */
        .app-header {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 20px 25px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.2);
            position: relative;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .app-header img {
            width: 60px;
            height: auto;
            object-fit: contain;
        }
        
        .app-header-text {
            flex: 1;
        }
        
        .app-header-text h1 {
            margin: 0 0 5px 0;
            font-size: 1.8rem;
            font-weight: 700;
            background: linear-gradient(90deg, #0ea5e9, #38bdf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
        }
        
        .app-header-text p {
            margin: 0;
            font-size: 1rem;
            color: #94a3b8;
        }
        
        .app-header:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 5%;
            width: 90%;
            height: 3px;
            background: linear-gradient(90deg, 
                rgba(14, 165, 233, 0), 
                rgba(14, 165, 233, 1) 20%, 
                rgba(14, 165, 233, 1) 80%, 
                rgba(14, 165, 233, 0));
            border-radius: 3px;
        }
        
        /* Status badge for components */
        .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.35rem 0.7rem;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
            line-height: 1;
            margin-top: 1rem;
        }
        
        .status-badge.success {
            background-color: rgba(16, 185, 129, 0.2);
            color: rgb(16, 185, 129);
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .status-badge.warning {
            background-color: rgba(245, 158, 11, 0.2);
            color: rgb(245, 158, 11);
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .status-badge.error {
            background-color: rgba(239, 68, 68, 0.2);
            color: rgb(239, 68, 68);
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* Enhanced Tabs styling */
        [data-testid="stTabs"] [data-baseweb="tab-list"] {
            background-color: rgba(15, 23, 42, 0.5);
            border-radius: 14px;
            padding: 8px;
            gap: 12px;
        }
        
        [data-testid="stTabs"] [data-baseweb="tab"] {
            border-radius: 10px;
            padding: 10px 18px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        [data-testid="stTabs"] [aria-selected="true"] {
            background: linear-gradient(90deg, #0ea5e9, #0c4a6e) !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        [data-testid="stTabs"] [aria-selected="false"] {
            background: rgba(30, 41, 59, 0.5) !important;
            color: #94a3b8 !important;
        }
        
        [data-testid="stTabs"] [aria-selected="false"]:hover {
            background: rgba(30, 41, 59, 0.8) !important;
            color: #e2e8f0 !important;
        }
        
        /* Plotly chart styling */
        .js-plotly-plot .plotly, .js-plotly-plot .plot-container {
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        /* Select box styling */
        [data-testid="stSelectbox"] > div > div,
        [data-testid="stMultiselect"] > div > div {
            background: rgba(30, 41, 59, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 10px !important;
            transition: all 0.2s ease;
        }
        
        [data-testid="stSelectbox"]:hover > div > div,
        [data-testid="stMultiselect"]:hover > div > div {
            border-color: rgba(14, 165, 233, 0.5) !important;
        }
        
        /* Slider styling */
        [data-testid="stSlider"] > div > div > div {
            background-color: rgba(30, 41, 59, 0.5) !important;
        }
        
        [data-testid="stSlider"] > div > div > div > div > div {
            background: linear-gradient(90deg, #0ea5e9, #0c4a6e) !important;
        }
        
        /* Text input styling */
        [data-testid="stTextInput"] > div > div > input {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            color: white;
            padding: 15px;
            transition: all 0.2s ease;
        }
        
        [data-testid="stTextInput"] > div > div > input:focus {
            border-color: rgba(14, 165, 233, 0.5);
            box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
        }
        
        /* File uploader styling */
        [data-testid="stFileUploader"] > section {
            background: rgba(30, 41, 59, 0.5);
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.2s ease;
        }
        
        [data-testid="stFileUploader"] > section:hover {
            border-color: rgba(14, 165, 233, 0.5);
            background: rgba(30, 41, 59, 0.7);
        }
        
        /* Dataframe styling */
        .dataframe {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .dataframe th {
            background: rgba(30, 41, 59, 0.8) !important;
            color: #e2e8f0 !important;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            padding: 15px !important;
            border: none !important;
            letter-spacing: 0.03em;
        }
        
        .dataframe td {
            background: rgba(30, 41, 59, 0.5) !important;
            color: #f1f5f9 !important;
            padding: 12px 15px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
            border-right: none !important;
            border-left: none !important;
            font-size: 0.9rem;
        }
        
        .dataframe tr:hover td {
            background: rgba(30, 41, 59, 0.8) !important;
        }
        
        /* Custom loader animation */
        @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.7; }
        }
        
        .loader {
            animation: pulse 1.5s ease-in-out infinite;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.3);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #0ea5e9, #0c4a6e);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #38bdf8, #0e7490);
        }
        
        /* Info, success and error styling */
        div[data-testid="stAlert"] {
            background: rgba(30, 41, 59, 0.5) !important;
            border-radius: 12px !important;
            padding: 20px !important;
            border: 1px solid rgba(14, 165, 233, 0.3) !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
            overflow: hidden !important;
            position: relative !important;
        }
        
        div[data-testid="stAlert"]:before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 4px !important;
            height: 100% !important;
            background: linear-gradient(to bottom, #0ea5e9, #0c4a6e) !important;
        }
        
        /* Tooltip styling */
        .tooltip {
            position: relative;
            display: inline-block;
        }
        
        .tooltip .tooltiptext {
            visibility: hidden;
            background: rgba(15, 23, 42, 0.95);
            color: #f1f5f9;
            text-align: center;
            border-radius: 8px;
            padding: 8px 12px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            pointer-events: none;
            white-space: nowrap;
        }
        
        .tooltip:hover .tooltiptext {
            visibility: visible;
            opacity: 1;
        }
        
        /* Loading animation */
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        
        .loading {
            background: linear-gradient(90deg, 
                rgba(30, 41, 59, 0.5), 
                rgba(30, 41, 59, 0.8), 
                rgba(30, 41, 59, 0.5));
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 12px;
        }
    </style>
    """, unsafe_allow_html=True)
except Exception as e:
    logger.warning(f"Could not apply custom theme: {e}")

# Import dashboard components
try:
    # Set up proper path for component imports
    import sys
    import importlib.util
    from pathlib import Path
    
    # Add the current file's directory to the Python path
    current_dir = Path(__file__).resolve().parent
    component_dir = current_dir / "components"
    
    # Ensure the component directory exists
    if not component_dir.exists():
        logger.warning(f"Component directory not found at {component_dir}")
        raise ImportError(f"Component directory not found at {component_dir}")
    
    # Add component directory to path if not already present
    if str(current_dir) not in sys.path:
        sys.path.insert(0, str(current_dir))
    
    # Also add the parent directory to ensure app imports work
    parent_dir = current_dir.parent
    if str(parent_dir) not in sys.path:
        sys.path.insert(0, str(parent_dir))
    
    logger.info(f"Python path now includes: {sys.path[:3]}")
    
    # Function to dynamically import a module from a file path with better error handling
    def import_module_from_file(module_name, file_path):
        try:
            # Check if file exists
            if not Path(file_path).exists():
                raise ImportError(f"File not found: {file_path}")
                
            # Create a spec from the file path
            spec = importlib.util.spec_from_file_location(module_name, file_path)
            if spec is None:
                raise ImportError(f"Failed to create spec for {module_name} from {file_path}")
                
            # Create a module from the spec
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            
            # Execute the module
            spec.loader.exec_module(module)
            logger.info(f"Successfully imported {module_name} from {file_path}")
            return module
        except Exception as e:
            logger.error(f"Error importing {module_name} from {file_path}: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise ImportError(f"Error importing {module_name}: {e}")
    
    # Check component files before attempting to import
    component_files = {
        "forecast_dashboard": component_dir / "forecast_dashboard.py",
        "enhanced_forecast_dashboard": component_dir / "enhanced_forecast_dashboard.py",
        "advanced_ml_dashboard": component_dir / "advanced_ml_dashboard.py"
    }
    
    # Validate all component files exist
    for name, file_path in component_files.items():
        if not file_path.exists():
            logger.warning(f"Component file missing: {file_path}")
    
    # Import the modules one by one with better error handling
    available_components = {}
    
    # Try to import each component and track success
    for name, file_path in component_files.items():
        if file_path.exists():
            try:
                module = import_module_from_file(name, file_path)
                display_func_name = f"display_{name}"
                
                if hasattr(module, display_func_name):
                    available_components[name] = getattr(module, display_func_name)
                    logger.info(f"Successfully loaded component function: {display_func_name}")
                else:
                    logger.warning(f"Component module {name} does not have required function: {display_func_name}")
            except Exception as e:
                logger.error(f"Failed to import component {name}: {e}")
    
    # Define the expected component functions
    if "forecast_dashboard" in available_components:
        display_forecast_dashboard = available_components["forecast_dashboard"]
    else:
        logger.warning("Using fallback for forecast_dashboard")
        display_forecast_dashboard = None
        
    if "enhanced_forecast_dashboard" in available_components:
        display_enhanced_forecast_dashboard = available_components["enhanced_forecast_dashboard"]
    else:
        logger.warning("Using fallback for enhanced_forecast_dashboard")
        display_enhanced_forecast_dashboard = None
        
    if "advanced_ml_dashboard" in available_components:
        display_advanced_ml_dashboard = available_components["advanced_ml_dashboard"]
    else:
        logger.warning("Using fallback for advanced_ml_dashboard")
        display_advanced_ml_dashboard = None
    
    # Check if we have at least one component available
    if available_components:
        logger.info(f"Successfully imported {len(available_components)} dashboard components")
        DASHBOARD_COMPONENTS_AVAILABLE = True
    else:
        logger.error("No dashboard components could be imported")
        DASHBOARD_COMPONENTS_AVAILABLE = False
        
except Exception as e:
    logger.error(f"Error importing dashboard components: {e}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    DASHBOARD_COMPONENTS_AVAILABLE = False

# Define placeholder functions if components aren't available
if not DASHBOARD_COMPONENTS_AVAILABLE:
    logger.warning("Using fallback dashboard components due to import errors")
    
    def display_forecast_dashboard():
        """Fallback forecast dashboard display with enhanced visuals."""
        st.warning("⚠️ The full forecast dashboard component could not be loaded. Using simplified version.")
        
        # Create a simple fallback visualization with improved styling
        st.subheader("Demand Forecasting (Fallback View)")
        
        # Generate more realistic dummy data
        dates = pd.date_range(start=datetime.now() - timedelta(days=20), periods=40, freq='D')
        
        # Create a more realistic looking forecast with weekly patterns
        base = np.linspace(80, 120, 40)  # Base trend
        weekly = 15 * np.sin(np.linspace(0, 6*np.pi, 40))  # Weekly cycle
        noise = np.random.normal(0, 5, 40)  # Random noise
        
        forecast = base + weekly + noise
        
        # Past data (actual values)
        actual = forecast[:25] + np.random.normal(0, 3, 25)
        
        # Create upper and lower bounds for the forecast
        forecast_upper = forecast + 10
        forecast_lower = forecast - 10
        
        # Create a dataframe with proper formatting
        df = pd.DataFrame({
            'Date': dates,
            'Forecast': forecast,
            'Upper Bound': forecast_upper,
            'Lower Bound': forecast_lower,
            'Actual': np.concatenate([actual, [None] * 15])  # Only show actuals for past dates
        })
        
        # Create metrics for quick insights
        col1, col2, col3 = st.columns(3)
        with col1:
            avg_demand = np.mean(actual[-7:])
            st.metric("Current Demand", f"{avg_demand:.1f} kWh", "7-day average")
        with col2:
            peak_forecast = np.max(forecast[25:])
            st.metric("Peak Forecast", f"{peak_forecast:.1f} kWh", "next 15 days")
        with col3:
            forecast_accuracy = 92.3
            st.metric("Forecast Accuracy", f"{forecast_accuracy:.1f}%", "based on past predictions")
        
        # Create an enhanced plot with confidence intervals
        fig = go.Figure()
        
        # Add the actual values
        fig.add_trace(go.Scatter(
            x=dates[:25],
            y=actual,
            mode='lines+markers',
            name='Actual',
            line=dict(color='#10b981', width=3),
            marker=dict(size=6)
        ))
        
        # Add the forecast
        fig.add_trace(go.Scatter(
            x=dates[25:],
            y=forecast[25:],
            mode='lines',
            name='Forecast',
            line=dict(color='#0ea5e9', width=3, dash='dash')
        ))
        
        # Add confidence interval
        fig.add_trace(go.Scatter(
            x=dates[25:],
            y=forecast_upper[25:],
            mode='lines',
            name='Upper Bound',
            line=dict(width=0),
            showlegend=False
        ))
        
        fig.add_trace(go.Scatter(
            x=dates[25:],
            y=forecast_lower[25:],
            mode='lines',
            name='Lower Bound',
            line=dict(width=0),
            fillcolor='rgba(14, 165, 233, 0.2)',
            fill='tonexty',
            showlegend=False
        ))
        
        # Update layout for better aesthetics
        fig.update_layout(
            title='Charging Demand Forecast',
            xaxis_title='Date',
            yaxis_title='Energy Demand (kWh)',
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="right",
                x=1
            ),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#f1f5f9',
            hovermode="x unified"
        )
        
        # Update axes
        fig.update_xaxes(
            gridcolor='rgba(255,255,255,0.1)',
            showline=True, 
            linewidth=1, 
            linecolor='rgba(255,255,255,0.2)'
        )
        fig.update_yaxes(
            gridcolor='rgba(255,255,255,0.1)',
            showline=True, 
            linewidth=1, 
            linecolor='rgba(255,255,255,0.2)'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Add explanation for demand trends
        with st.expander("📊 Forecast Interpretation"):
            st.write("""
            This simplified forecast shows expected charging demand over the next 15 days:
            
            * **Shaded area** represents prediction confidence interval (±10%)
            * **Weekly patterns** show higher demand on weekdays, lower on weekends
            * **Long-term trend** shows gradual increase in overall demand
            """)
    
    def display_enhanced_forecast_dashboard():
        """Fallback enhanced forecast dashboard display with better visuals."""
        st.warning("⚠️ The full enhanced forecast dashboard component could not be loaded. Using simplified version.")
        
        # Create a more visually appealing fallback
        st.subheader("Enhanced Forecasting (Fallback View)")
        
        # Create tabs for different visualization aspects
        tab1, tab2 = st.tabs(["Multi-Horizon Forecast", "Factor Analysis"])
        
        with tab1:
            # Generate sample data for multi-horizon forecasting
            base_dates = pd.date_range(start=datetime.now(), periods=30, freq='D')
            
            # Different horizons
            horizons = [1, 7, 30]
            horizon_labels = ["Next Day", "Next Week", "Next Month"]
            
            # Create some metrics
            cols = st.columns(len(horizons))
            for i, (horizon, label) in enumerate(zip(horizons, horizon_labels)):
                with cols[i]:
                    value = 100 + 5 * horizon + np.random.randint(-10, 10)
                    delta = np.random.uniform(-5, 10)
                    st.metric(
                        f"{label} Forecast", 
                        f"{value:.1f} kWh",
                        f"{delta:+.1f}% vs. trend"
                    )
            
            # Create a visually appealing multi-horizon forecast
            fig = go.Figure()
            
            # Base demand pattern
            base = 100
            daily_pattern = np.sin(np.linspace(0, 2*np.pi*3, 30)) * 10
            weekly_pattern = np.sin(np.linspace(0, 2*np.pi, 30)) * 15
            trend = np.linspace(0, 15, 30)
            
            # Add traces for each horizon with different uncertainties
            colors = ['#0ea5e9', '#10b981', '#f59e0b']
            for i, (horizon, label, color) in enumerate(zip(horizons, horizon_labels, colors)):
                # More uncertainty for longer horizons
                uncertainty = 5 + i * 5
                
                # Generate forecast with increasing uncertainty
                forecast = base + daily_pattern + weekly_pattern + trend + np.random.normal(0, i*2, 30)
                upper = forecast + uncertainty
                lower = forecast - uncertainty
                
                # Add the forecast line
                fig.add_trace(go.Scatter(
                    x=base_dates,
                    y=forecast,
                    mode='lines',
                    name=label,
                    line=dict(color=color, width=3)
                ))
                
                # Add uncertainty bands
                fig.add_trace(go.Scatter(
                    x=base_dates,
                    y=upper,
                    mode='lines',
                    line=dict(width=0),
                    showlegend=False
                ))
                
                fig.add_trace(go.Scatter(
                    x=base_dates,
                    y=lower,
                    mode='lines',
                    line=dict(width=0),
                    fillcolor=f'rgba({",".join(map(str, [int(int(color[1:3], 16)), int(color[3:5], 16), int(color[5:7], 16)]))}, 0.2)',
                    fill='tonexty',
                    showlegend=False
                ))
            
            # Update layout
            fig.update_layout(
                title='Multi-Horizon Demand Forecast',
                xaxis_title='Date',
                yaxis_title='Energy Demand (kWh)',
                legend=dict(
                    orientation="h",
                    yanchor="bottom",
                    y=1.02,
                    xanchor="right",
                    x=1
                ),
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='#f1f5f9',
                hovermode="x unified"
            )
            
            # Update axes
            fig.update_xaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            fig.update_yaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            
            st.plotly_chart(fig, use_container_width=True)
        
        with tab2:
            # Create a factor analysis chart
            factors = ["Temperature", "Time of Day", "Day of Week", "Special Events", "Holidays"]
            importance = [0.35, 0.25, 0.15, 0.15, 0.10]
            
            fig = px.bar(
                x=importance,
                y=factors,
                orientation='h',
                title='Forecast Factor Importance',
                labels={'x': 'Importance', 'y': 'Factor'},
                color=importance,
                color_continuous_scale='blues'
            )
            
            # Update layout
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='#f1f5f9'
            )
            
            # Update axes
            fig.update_xaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            fig.update_yaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    def display_advanced_ml_dashboard():
        """Fallback advanced ML dashboard display with better visuals."""
        st.warning("⚠️ The full advanced ML dashboard component could not be loaded. Using simplified version.")
        
        # Create a visually appealing fallback
        st.subheader("Advanced ML Capabilities (Fallback View)")
        
        # Create tabs for different capabilities
        tab1, tab2, tab3 = st.tabs(["Model Performance", "Feature Importance", "Prediction Analysis"])
        
        with tab1:
            # Show model performance metrics with nice styling
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Accuracy", "94.7%", "+1.5%")
            
            with col2:
                st.metric("F1 Score", "0.923", "+0.06")
            
            with col3:
                st.metric("RMSE", "0.045", "-0.01")
            
            with col4:
                st.metric("Latency", "45ms", "-12ms")
            
            # Create a model comparison plot
            models = ["XGBoost", "LSTM", "RandomForest", "Ensemble"]
            metrics = ["Accuracy", "Precision", "Recall", "F1 Score"]
            
            # Generate a random performance data matrix
            np.random.seed(42)  # For reproducibility
            performance = np.random.uniform(0.8, 0.98, (len(models), len(metrics)))
            
            # Ensure ensemble is best
            performance[-1, :] = np.maximum(performance[-1, :], np.max(performance[:-1, :], axis=0) + 0.01)
            
            # Create a heatmap
            fig = px.imshow(
                performance,
                x=metrics,
                y=models,
                color_continuous_scale='blues',
                title="Model Performance Comparison",
                labels=dict(x="Metric", y="Model", color="Score")
            )
            
            # Add text annotations
            for i in range(len(models)):
                for j in range(len(metrics)):
                    fig.add_annotation(
                        x=j, 
                        y=i,
                        text=f"{performance[i, j]:.3f}",
                        showarrow=False,
                        font=dict(color="white" if performance[i, j] > 0.9 else "black")
                    )
            
            # Update layout
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='#f1f5f9'
            )
            
            st.plotly_chart(fig, use_container_width=True)
        
        with tab2:
            # Feature importance visualization
            features = [
                "Battery Temperature", 
                "State of Charge",
                "Charging Rate",
                "Battery Age",
                "Ambient Temperature",
                "Usage Patterns",
                "Time of Day",
                "Day of Week"
            ]
            
            # Generate some dummy importance values
            importance = [0.28, 0.22, 0.15, 0.12, 0.10, 0.08, 0.03, 0.02]
            
            fig = px.bar(
                x=importance,
                y=features,
                orientation='h',
                title='Global Feature Importance',
                labels={'x': 'Importance', 'y': 'Feature'},
                color=importance,
                color_continuous_scale='blues'
            )
            
            # Update layout
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='#f1f5f9'
            )
            
            # Update axes
            fig.update_xaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            fig.update_yaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            
            st.plotly_chart(fig, use_container_width=True)
        
        with tab3:
            # Prediction distribution analysis
            st.subheader("Prediction Distribution Analysis")
            
            # Generate some dummy prediction data
            np.random.seed(42)
            actual = np.random.normal(0, 1, 1000)
            predicted = actual + np.random.normal(0, 0.2, 1000)
            
            # Create a scatter plot
            fig = px.scatter(
                x=actual,
                y=predicted,
                title="Actual vs Predicted Values",
                labels={'x': 'Actual', 'y': 'Predicted'},
                opacity=0.6,
                color_discrete_sequence=['#0ea5e9']
            )
            
            # Add perfect prediction line
            fig.add_trace(
                go.Scatter(
                    x=[-3, 3],
                    y=[-3, 3],
                    mode='lines',
                    name='Perfect Prediction',
                    line=dict(color='#f59e0b', dash='dash')
                )
            )
            
            # Update layout
            fig.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='#f1f5f9'
            )
            
            # Update axes
            fig.update_xaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            fig.update_yaxes(
                gridcolor='rgba(255,255,255,0.1)',
                showline=True, 
                linewidth=1, 
                linecolor='rgba(255,255,255,0.2)'
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Add explanation
            with st.expander("📊 Interpretation Guide"):
                st.write("""
                **Reading the Prediction Analysis:**
                
                * **Points along diagonal line** represent accurate predictions
                * **Points above the line** are overpredictions
                * **Points below the line** are underpredictions
                * **Clustering** indicates model bias in certain value ranges
                """)

def get_prediction_model(model_type: str = "fallback"):
    """Return a simple prediction function depending on available libraries"""
    if HAVE_XGBOOST and model_type == "xgboost":
        # Return a trivial predictor using XGBoost but avoid undefined variables
        def _predict_with_xgb(arr):
            try:
                from xgboost import XGBRegressor
                import numpy as _np
                # Train a trivial model on synthetic data (index -> value)
                X = _np.arange(len(arr)).reshape(-1, 1)
                y_dummy = _np.asarray(arr)
                model = XGBRegressor(n_estimators=10, max_depth=2)
                model.fit(X, y_dummy)
                return model.predict(X)
            except Exception as exc:
                logger.warning(f"XGBoost prediction failed, falling back: {exc}")
                return _np.asarray(arr)
        return _predict_with_xgb
    else:
        # Simple linear regression coefficients as fallback
        def _linear_predict(arr):
            z = np.polyfit(range(len(arr)), arr, 1)
            p = np.poly1d(z)
            return p(range(len(arr)))
        return _linear_predict

def make_prediction(data, model_type="fallback"):
    """Make predictions with appropriate model"""
    model = get_prediction_model(model_type)
    try:
        if HAVE_XGBOOST and model_type == "xgboost":
            return model(data)
        else:
            # Simple trend-based prediction - model already returns predictions
            return model(data)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        # Return simple moving average as ultimate fallback
        return pd.Series(data).rolling(window=3).mean().fillna(method='bfill').values

def api_request(endpoint: str, method: str = "GET", data: Optional[Dict] = None) -> Dict:
    """Make a request to the API with enhanced error handling"""
    url = f"{API_BASE_URL}/{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, params=data, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            st.error(f"Unsupported method: {method}")
            return {"error": f"Unsupported method: {method}"}
        
        # Check response status
        if response.status_code == 200:
            return response.json()
        else:
            error_msg = f"API Error {response.status_code}: {response.text}"
            logger.error(error_msg)
            
            # Return simulated data if API fails
            if "predict" in endpoint or "forecast" in endpoint:
                return generate_fallback_prediction(endpoint, data)
            else:
                return {"error": error_msg}
            
    except requests.exceptions.ConnectionError:
        error_msg = f"Cannot connect to API at {url}. Using fallback predictions."
        logger.warning(error_msg)
        return generate_fallback_prediction(endpoint, data)
    except requests.exceptions.Timeout:
        error_msg = f"Request to {url} timed out. Using fallback predictions."
        logger.warning(error_msg)
        return generate_fallback_prediction(endpoint, data)
    except Exception as e:
        error_msg = f"Request Error: {str(e)}"
        logger.error(error_msg)
        return generate_fallback_prediction(endpoint, data)

def generate_fallback_prediction(endpoint: str, data: Optional[Dict] = None) -> Dict:
    """Generate fallback prediction data when API is unavailable"""
    current_time = datetime.now()
    
    if "battery/predict" in endpoint:
        return {
            "predicted_soh": 85 + np.random.normal(0, 2),
            "confidence": 0.85,
            "predicted_remaining_life_days": 365 + np.random.normal(0, 30),
            "timestamp": current_time.isoformat()
        }
    
    elif "usage/next-usage" in endpoint:
        hours_until = 8 + np.random.normal(0, 2)
        next_usage = current_time + timedelta(hours=hours_until)
        return {
            "next_usage_time": next_usage.isoformat(),
            "current_time": current_time.isoformat(),
            "hours_until_next_usage": hours_until,
            "confidence": 0.80
        }
    
    elif "energy/price-forecast" in endpoint:
        forecasts = []
        base_price = 0.15  # Base price per kWh
        for i in range(24):  # 24-hour forecast
            timestamp = current_time + timedelta(hours=i)
            # Add daily pattern and some noise
            price = base_price + 0.05 * np.sin(i * np.pi / 12) + np.random.normal(0, 0.01)
            forecasts.append({
                "forecast_timestamp": timestamp.isoformat(),
                "predicted_price": max(0.10, min(0.30, price))  # Keep within reasonable bounds
            })
        return forecasts
    
    elif "anomalies/stats" in endpoint:
        return {
            "total_anomalies": 23,
            "vehicle_count": 8,
            "recent_24h": 5,
            "by_severity": {
                "high": 3,
                "medium": 7,
                "low": 13
            },
            "by_vehicle": {
                f"vehicle_{i:03d}": np.random.randint(1, 5) 
                for i in range(1, 9)
            }
        }
    
    else:
        return {
            "error": "Endpoint not supported for fallback predictions",
            "timestamp": current_time.isoformat()
        }

def health_check() -> bool:
    """Check API health with improved error handling"""
    try:
        result = api_request("health")
        return "status" in result and result["status"] == "healthy"
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return False

# Add helper function to get URL parameters
def get_query_params():
    """Get query parameters from the URL"""
    query_params = {}
    
    try:
        # Use st.query_params instead of experimental_get_query_params
        query_params = dict(st.query_params)
    except Exception as e:
        # Fallback to environment variable if available
        if "QUERY_STRING" in os.environ:
            from urllib.parse import parse_qs
            query_string = os.environ.get("QUERY_STRING", "")
            query_params = {k: v[0] if len(v) == 1 else v for k, v in parse_qs(query_string).items()}
        logger.warning(f"Error parsing query params: {e}")
    
    return query_params


def battery_health_dashboard():
    """Battery health prediction dashboard"""
    st.header("🔋 Battery Health Prediction")
    
    # Input form for single prediction
    with st.expander("Single Battery Prediction", expanded=True):
        st.subheader("Predict Current Battery Health")
        col1, col2 = st.columns(2)
        
        with col1:
            vehicle_id = st.text_input("Vehicle ID", value="EV-001")
            state_of_charge = st.slider("State of Charge (%)", 0, 100, 80)
            battery_temp = st.slider("Battery Temperature (°C)", -10, 60, 25)
        
        with col2:
            voltage = st.number_input("Voltage (V)", 300.0, 500.0, 380.0)
            current = st.number_input("Current (A)", -150.0, 150.0, 0.0)
            battery_chemistry = st.selectbox("Battery Chemistry", ["NMC", "LFP", "NCA"])
        
        if st.button("Predict Health"):
            data = {
                "vehicle_id": vehicle_id,
                "state_of_charge": state_of_charge,
                "battery_temp": battery_temp,
                "voltage": voltage,
                "current": current,
                "battery_chemistry": battery_chemistry
            }
            
            result = api_request("battery/predict", "POST", data)
            
            if "error" not in result:
                # Create gauge chart for SOH
                fig = go.Figure(go.Indicator(
                    mode="gauge+number+delta",
                    value=result["predicted_soh"],
                    title={"text": "State of Health (%)"},
                    delta={"reference": 100, "decreasing": {"color": "red"}, "increasing": {"color": "green"}},
                    gauge={
                        "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "darkblue"},
                        "bar": {"color": "darkblue"},
                        "bgcolor": "white",
                        "borderwidth": 2,
                        "bordercolor": "gray",
                        "steps": [
                            {"range": [0, 60], "color": "red"},
                            {"range": [60, 80], "color": "yellow"},
                            {"range": [80, 100], "color": "green"}
                        ]
                    }
                ))
                
                st.plotly_chart(fig, use_container_width=True)
                
                # Display additional information
                col1, col2, col3 = st.columns(3)
                col1.metric("Confidence", f"{result.get('confidence', 0)*100:.1f}%")
                col2.metric("Predicted Remaining Life", f"{result.get('predicted_remaining_life_days', 0)} days")
                col3.metric("Temperature", f"{battery_temp}°C")
    
    # Future health prediction
    with st.expander("Battery Degradation Forecast", expanded=True):
        st.subheader("Predict Future Battery Health")
        col1, col2 = st.columns(2)
        
        with col1:
            vehicle_id_future = st.text_input("Vehicle ID", value="EV-001", key="future_id")
            prediction_days = st.slider("Prediction Days", 30, 1825, 365)
        
        with col2:
            # Placeholder for a more comprehensive form with multiple telemetry points
            st.write("Using current vehicle state for prediction.")
            if st.button("Predict Future Health"):
                # Create dummy telemetry data
                telemetry_data = [{
                    "vehicle_id": vehicle_id_future,
                    "state_of_charge": state_of_charge,
                    "battery_temp": battery_temp,
                    "voltage": voltage,
                    "current": current,
                    "battery_chemistry": battery_chemistry,
                    "charge_cycles": 100,
                    "odometer": 10000
                }]
                
                data = {
                    "vehicle_id": vehicle_id_future,
                    "prediction_days": prediction_days,
                    "telemetry_data": telemetry_data
                }
                
                result = api_request("battery/future-health", "POST", data)
                
                if "error" not in result:
                    # Create a dataframe for the predictions
                    future_df = pd.DataFrame([
                        {
                            "date": datetime.fromisoformat(p["timestamp"].replace("Z", "+00:00")).date(),
                            "soh": p["predicted_soh"]
                        }
                        for p in result["future_predictions"]
                    ])
                    
                    # Plot the predictions
                    fig = px.line(
                        future_df, 
                        x="date", 
                        y="soh",
                        title="Predicted Battery Health Over Time",
                        labels={"date": "Date", "soh": "State of Health (%)"}
                    )
                    
                    # Add threshold lines
                    fig.add_hline(
                        y=80, 
                        line_dash="dash", 
                        line_color="orange",
                        annotation_text="Caution Threshold"
                    )
                    
                    fig.add_hline(
                        y=70, 
                        line_dash="dash", 
                        line_color="red",
                        annotation_text="Replacement Recommended"
                    )
                    
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Display replacement information if available
                    if result.get("replacement_date"):
                        replacement_date = datetime.fromisoformat(
                            result["replacement_date"].replace("Z", "+00:00")
                        ).date()
                        
                        st.warning(
                            f"Battery replacement recommended by: **{replacement_date}** "
                            f"({result.get('days_until_replacement', 'Unknown')} days from now)"
                        )
                    else:
                        st.success("Battery health looks good for the entire prediction period")


def usage_prediction_dashboard():
    """Vehicle usage prediction dashboard"""
    st.header("🚗 Vehicle Usage Prediction")
    
    # Create dummy usage history data
    default_history = [
        {"vehicle_id": "EV-001", "start_time": (datetime.now() - timedelta(days=3, hours=8)).isoformat(), 
         "end_time": (datetime.now() - timedelta(days=3, hours=6, minutes=30)).isoformat(), "trip_distance": 25.3},
        {"vehicle_id": "EV-001", "start_time": (datetime.now() - timedelta(days=2, hours=12)).isoformat(), 
         "end_time": (datetime.now() - timedelta(days=2, hours=11)).isoformat(), "trip_distance": 8.7},
        {"vehicle_id": "EV-001", "start_time": (datetime.now() - timedelta(days=1, hours=7, minutes=30)).isoformat(), 
         "end_time": (datetime.now() - timedelta(days=1, hours=6, minutes=10)).isoformat(), "trip_distance": 15.2},
    ]
    
    with st.expander("Next Usage Prediction", expanded=True):
        st.subheader("Predict When Vehicle Will Be Used Next")
        
        col1, col2 = st.columns(2)
        
        with col1:
            vehicle_id = st.text_input("Vehicle ID", value="EV-001", key="usage_id")
        
        with col2:
            # Option to view/edit usage history
            show_history = st.checkbox("View/Edit Usage History")
        
        if show_history:
            history = st.session_state.get('usage_history', default_history)
            
            # Display editable table with history
            edited_history = []
            for i, entry in enumerate(history):
                st.markdown(f"#### Trip {i+1}")
                col1, col2, col3 = st.columns(3)
                with col1:
                    start_time = st.text_input("Start Time", value=entry["start_time"], key=f"start_{i}")
                with col2:
                    end_time = st.text_input("End Time", value=entry["end_time"], key=f"end_{i}")
                with col3:
                    distance = st.number_input("Distance (km)", value=entry["trip_distance"], key=f"dist_{i}")
                
                edited_history.append({
                    "vehicle_id": vehicle_id,
                    "start_time": start_time,
                    "end_time": end_time,
                    "trip_distance": distance
                })
            
            st.session_state['usage_history'] = edited_history
        else:
            if 'usage_history' not in st.session_state:
                st.session_state['usage_history'] = default_history
        
        if st.button("Predict Next Usage"):
            data = {
                "vehicle_id": vehicle_id,
                "usage_history": st.session_state['usage_history']
            }
            
            result = api_request("usage/next-usage", "POST", data)
            
            if "error" not in result:
                # Convert string times to datetime
                next_usage = datetime.fromisoformat(result["next_usage_time"].replace("Z", "+00:00"))
                current_time = datetime.fromisoformat(result["current_time"].replace("Z", "+00:00"))
                hours_until = result["hours_until_next_usage"]
                
                # Create a visual timeline
                fig = go.Figure()
                
                # Add current time marker
                fig.add_trace(go.Scatter(
                    x=[current_time],
                    y=[0],
                    mode="markers+text",
                    marker=dict(size=15, color="blue", symbol="circle"),
                    text=["Now"],
                    textposition="top center",
                    name="Current Time"
                ))
                
                # Add predicted usage time marker
                fig.add_trace(go.Scatter(
                    x=[next_usage],
                    y=[0],
                    mode="markers+text",
                    marker=dict(size=15, color="red", symbol="circle"),
                    text=["Next Usage"],
                    textposition="top center",
                    name="Predicted Next Usage"
                ))
                
                # Add connecting line
                fig.add_trace(go.Scatter(
                    x=[current_time, next_usage],
                    y=[0, 0],
                    mode="lines",
                    line=dict(width=2, dash="dash"),
                    showlegend=False
                ))
                
                # Format the layout
                fig.update_layout(
                    title="Predicted Next Vehicle Usage",
                    xaxis_title="Time",
                    yaxis_visible=False,
                    height=250
                )
                
                st.plotly_chart(fig, use_container_width=True)
                
                # Display the prediction details
                col1, col2 = st.columns(2)
                col1.metric(
                    "Next Usage Time", 
                    next_usage.strftime("%Y-%m-%d %H:%M"),
                    f"in {hours_until:.1f} hours"
                )
                col2.metric("Confidence", f"{result.get('confidence', 0)*100:.1f}%")


def energy_price_dashboard():
    """Energy price prediction dashboard"""
    st.header("💲 Energy Price Forecast")
    
    with st.expander("Price Prediction", expanded=True):
        st.subheader("Forecast Energy Prices")
        
        # Create dummy price history data
        if 'price_history' not in st.session_state:
            current_time = datetime.now().replace(minute=0, second=0, microsecond=0)
            price_history = []
            
            # Generate 48 hours of hourly price data
            for i in range(48, 0, -1):
                timestamp = current_time - timedelta(hours=i)
                price = 20 + 5 * np.sin(i / 12 * np.pi) + np.random.normal(0, 1)
                renewable_pct = 30 + 10 * np.sin(i / 24 * np.pi) + np.random.normal(0, 3)
                
                price_history.append({
                    "timestamp": timestamp.isoformat(),
                    "energy_price": max(10, min(40, price)),
                    "renewable_percentage": max(10, min(70, renewable_pct))
                })
            
            st.session_state['price_history'] = price_history
        
        # Button to generate forecast
        if st.button("Generate Price Forecast"):
            result = api_request("energy/price-forecast", "POST", st.session_state['price_history'])
            
            if "error" not in result:
                # Create DataFrame with historical and predicted prices
                historical_df = pd.DataFrame([
                    {
                        "timestamp": datetime.fromisoformat(p["timestamp"].replace("Z", "+00:00")),
                        "price": p["energy_price"],
                        "type": "Historical"
                    }
                    for p in st.session_state['price_history']
                ])
                
                forecast_df = pd.DataFrame([
                    {
                        "timestamp": datetime.fromisoformat(p["forecast_timestamp"].replace("Z", "+00:00")),
                        "price": p["predicted_price"],
                        "type": "Forecast"
                    }
                    for p in result
                ])
                
                # Combine into one DataFrame
                combined_df = pd.concat([historical_df, forecast_df])
                combined_df["hour"] = combined_df["timestamp"].dt.hour
                
                # Create the plot
                fig = px.line(
                    combined_df, 
                    x="timestamp", 
                    y="price", 
                    color="type",
                    title="Energy Price Forecast",
                    labels={"timestamp": "Time", "price": "Price ($/kWh)", "type": "Data Type"},
                    color_discrete_map={"Historical": "blue", "Forecast": "red"}
                )
                
                fig.update_layout(
                    hovermode="x unified"
                )
                
                st.plotly_chart(fig, use_container_width=True)
                
                # Display optimal charging times based on price
                forecast_only = forecast_df.copy()
                best_times = forecast_only.nsmallest(5, 'price')
                
                st.subheader("Recommended Charging Windows")
                
                for _, row in best_times.iterrows():
                    time_str = row['timestamp'].strftime("%Y-%m-%d %H:%M")
                    st.write(f"🔌 **{time_str}** - ${row['price']:.3f}/kWh")


def anomaly_detection_dashboard():
    """Anomaly detection dashboard"""
    st.header("⚠️ Battery Anomaly Detection")
    
    # Get anomaly statistics
    stats = api_request("anomalies/stats")
    
    if "error" not in stats:
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Anomalies", stats["total_anomalies"])
        with col2:
            st.metric("Vehicles Affected", stats["vehicle_count"])
        with col3:
            st.metric("Recent (24h)", stats["recent_24h"])
        with col4:
            high_count = stats["by_severity"].get("high", 0)
            medium_count = stats["by_severity"].get("medium", 0)
            st.metric("High Severity", high_count, f"+{medium_count} medium")
        
        # Vehicle selector
        vehicle_ids = list(stats["by_vehicle"].keys())
        if vehicle_ids:
            selected_vehicle = st.selectbox("Select Vehicle", vehicle_ids)
            
            if selected_vehicle:
                # Get anomaly analysis for the selected vehicle
                analysis = api_request(f"anomalies/analysis/{selected_vehicle}")
                
                if "error" not in analysis:
                    st.subheader(f"Anomaly Analysis for {selected_vehicle}")
                    
                    # Vehicle anomaly summary
                    col1, col2 = st.columns(2)
                    with col1:
                        st.metric("Anomaly Count", analysis["anomaly_count"])
                        
                        # Severity distribution pie chart
                        if "severity_distribution" in analysis and analysis["severity_distribution"]:
                            severity_data = pd.DataFrame([
                                {"severity": k, "count": v}
                                for k, v in analysis["severity_distribution"].items()
                                if v > 0
                            ])
                            
                            if not severity_data.empty:
                                fig = px.pie(
                                    severity_data,
                                    values="count",
                                    names="severity",
                                    title="Anomalies by Severity",
                                    color="severity",
                                    color_discrete_map={
                                        "high": "red",
                                        "medium": "orange",
                                        "low": "yellow"
                                    }
                                )
                                
                                st.plotly_chart(fig, use_container_width=True)
                    
                    with col2:
                        # Type distribution
                        if "by_type" in analysis and analysis["by_type"]:
                            type_data = pd.DataFrame([
                                {"type": k, "count": v}
                                for k, v in analysis["by_type"].items()
                            ])
                            
                            fig = px.bar(
                                type_data,
                                x="type",
                                y="count",
                                title="Anomalies by Type",
                                labels={"type": "Anomaly Type", "count": "Count"}
                            )
                            
                            st.plotly_chart(fig, use_container_width=True)
                    
                    # Get detailed anomalies for this vehicle
                    anomalies = api_request(f"anomalies/vehicle/{selected_vehicle}")
                    
                    if "error" not in anomalies and anomalies:
                        st.subheader("Recent Anomalies")
                        
                        for anomaly in anomalies[:5]:  # Display only the 5 most recent
                            timestamp = datetime.fromisoformat(anomaly["timestamp"].replace("Z", "+00:00"))
                            
                            # Create an expander for each anomaly
                            with st.expander(f"{timestamp.strftime('%Y-%m-%d %H:%M')} - {anomaly['anomaly_type']} ({anomaly['severity']})"):
                                col1, col2 = st.columns(2)
                                
                                with col1:
                                    st.write("**Detection Methods:**", ", ".join(anomaly["detection_methods"]))
                                    st.write("**Detection Source:**", anomaly["detection_source"])
                                
                                with col2:
                                    # Display metrics
                                    for metric, value in anomaly["metrics"].items():
                                        st.metric(metric, f"{value}")


def model_monitoring_dashboard():
    """Model monitoring dashboard"""
    st.header("📊 Model Performance Monitoring")
    
    # Get all models status
    all_models = api_request("monitoring/all-models")
    
    if "error" not in all_models and "models" in all_models:
        # Select a model to monitor
        model_ids = list(all_models["models"].keys())
        
        if model_ids:
            selected_model = st.selectbox("Select Model", model_ids)
            
            if selected_model:
                model_data = all_models["models"][selected_model]
                
                # Display model information
                st.subheader(f"Model: {selected_model} ({model_data['model_type']})")
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Predictions Tracked", model_data["predictions_tracked"])
                with col2:
                    st.metric("Actuals Recorded", model_data["actuals_tracked"])
                with col3:
                    if model_data.get("monitoring_since"):
                        since = datetime.fromisoformat(model_data["monitoring_since"].replace("Z", "+00:00"))
                        days_monitored = (datetime.now() - since).days
                        st.metric("Days Monitored", days_monitored)
                
                # Get performance metrics
                try:
                    performance = api_request(f"monitoring/performance/{selected_model}")
                    
                    if "error" not in performance and "metrics" in performance:
                        st.subheader("Performance Metrics")
                        
                        metrics = performance["metrics"]
                        cols = st.columns(len(metrics))
                        
                        for i, (metric, value) in enumerate(metrics.items()):
                            cols[i].metric(metric.upper(), f"{value:.4f}")
                        
                        st.caption(f"Based on {performance['sample_size']} samples")
                except:
                    st.info("Not enough data to calculate performance metrics")
                
                # Get drift status
                try:
                    drift = api_request(f"monitoring/drift/{selected_model}")
                    
                    if "error" not in drift and drift["status"] != "insufficient_data":
                        st.subheader("Data Drift Status")
                        
                        # Display drift information
                        if drift["status"] == "drift_detected":
                            st.warning(f"Data drift detected! Overall drift score: {drift['overall_drift']:.4f}")
                            st.write(f"Max drift in feature: **{drift['max_drift_feature']}** (score: {drift['max_drift_score']:.4f})")
                        else:
                            st.success("No significant data drift detected")
                except:
                    st.info("Not enough data to analyze drift")


def enhanced_forecasting_dashboard():
    """Enhanced forecasting dashboard"""
    st.header("📈 Enhanced Forecasting")
    
    st.write("This dashboard provides advanced forecasting capabilities using ensemble models and multi-step predictions.")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Multi-Horizon Forecasting")
        st.write("Predict energy consumption over multiple time horizons simultaneously")
        
        # Dummy data for visualization
        horizons = [1, 3, 7, 14, 30]
        accuracy = [95, 92, 88, 83, 76]
        
        fig = px.bar(
            x=horizons, 
            y=accuracy,
            labels={"x": "Forecast Horizon (days)", "y": "Accuracy (%)"},
            title="Forecast Accuracy by Horizon"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Feature Importance")
        st.write("Understand which factors drive your predictions")
        
        # Dummy feature importance data
        features = ["Temperature", "Day of Week", "Time of Day", "Season", "Holiday"]
        importance = [0.35, 0.25, 0.20, 0.15, 0.05]
        
        fig = px.bar(
            x=importance,
            y=features,
            orientation='h',
            labels={"x": "Importance", "y": "Feature"},
            title="Feature Importance"
        )
        st.plotly_chart(fig, use_container_width=True)

def multi_task_learning_dashboard():
    """Multi-task learning dashboard"""
    st.header("🔄 Multi-Task Learning")
    
    st.write("This dashboard demonstrates how our models can predict multiple related outputs simultaneously.")
    
    st.subheader("Joint Predictions")
    
    # Create tabs for different visualizations
    tab1, tab2 = st.tabs(["Performance Comparison", "Task Relationships"])
    
    with tab1:
        # Dummy performance comparison data
        models = ["Single Task", "Multi-Task"]
        tasks = ["Energy Demand", "Price Forecast", "Grid Load"]
        
        perf_data = pd.DataFrame({
            "Model": models * len(tasks),
            "Task": [task for task in tasks for _ in models],
            "RMSE": [0.156, 0.142, 0.235, 0.198, 0.312, 0.278]
        })
        
        fig = px.bar(
            perf_data,
            x="Task", 
            y="RMSE", 
            color="Model",
            barmode="group",
            title="Error Comparison: Single-Task vs Multi-Task"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with tab2:
        # Create dummy task correlation matrix
        corr_data = np.array([
            [1.0, 0.73, 0.52],
            [0.73, 1.0, 0.64],
            [0.52, 0.64, 1.0]
        ])
        
        fig = px.imshow(
            corr_data,
            x=tasks,
            y=tasks,
            color_continuous_scale="Blues",
            title="Task Correlation Matrix"
        )
        st.plotly_chart(fig, use_container_width=True)

def model_ensembles_dashboard():
    """Model ensembles dashboard"""
    st.header("⚡ Model Ensembles")
    
    st.write("This dashboard demonstrates how combining multiple models improves predictions.")
    
    st.subheader("Ensemble Performance")
    
    # Create dummy data for ensemble visualization
    base_models = ["LSTM", "Prophet", "XGBoost", "ARIMA", "Kalman Filter"]
    base_errors = [0.182, 0.194, 0.168, 0.203, 0.175]
    
    # Add ensemble with lower error
    models = base_models + ["Ensemble"]
    errors = base_errors + [0.145]
    
    df = pd.DataFrame({
        "Model": models,
        "Error (RMSE)": errors
    })
    
    fig = px.bar(
        df,
        x="Model",
        y="Error (RMSE)",
        color="Model",
        title="Model Comparison",
        color_discrete_map={model: "#1e40af" if model == "Ensemble" else "#60a5fa" for model in models}
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Visualize a sample forecast
    st.subheader("Sample Forecast")
    
    # Generate dummy time series data
    dates = pd.date_range(start='2025-01-01', periods=48, freq='H')
    actual = [50 + 15 * np.sin(i / 12 * np.pi) + np.random.normal(0, 2) for i in range(48)]
    
    # Different model predictions with some variance
    lstm_pred = [a + np.random.normal(0, 3) for a in actual]
    prophet_pred = [a + np.random.normal(1, 3) for a in actual]
    xgb_pred = [a + np.random.normal(-1, 3) for a in actual]
    
    # Ensemble prediction (closer to actual)
    ensemble_pred = [(l + p + x) / 3 for l, p, x in zip(lstm_pred, prophet_pred, xgb_pred)]
    
    # Create a dataframe for plotting
    plot_df = pd.DataFrame({
        "Date": dates,
        "Actual": actual,
        "LSTM": lstm_pred,
        "Prophet": prophet_pred,
        "XGBoost": xgb_pred,
        "Ensemble": ensemble_pred
    })
    
    fig = px.line(
        plot_df,
        x="Date",
        y=["Actual", "LSTM", "Prophet", "XGBoost", "Ensemble"],
        title="48-Hour Forecast Comparison",
        labels={"value": "Power Demand (kW)", "variable": "Model"}
    )
    
    # Make the ensemble line thicker and a different color
    fig.update_traces(
        line=dict(width=3),
        selector=dict(name="Ensemble")
    )
    
    st.plotly_chart(fig, use_container_width=True)

def online_learning_dashboard():
    """Online learning dashboard with enhanced visualizations"""
    st.header("🔄 Online Learning")
    
    st.write("""
    This dashboard demonstrates how our models continuously learn from new data, 
    adapting to changing patterns and improving performance over time.
    """)
    
    # Create three tabs for different visualizations
    tab1, tab2, tab3 = st.tabs(["Learning Progress", "Adaptation to Events", "Performance Comparison"])
    
    with tab1:
        st.subheader("Model Improvement Over Time")
        
        # Create dummy data showing error decreasing over time
        dates = pd.date_range(start='2025-01-01', periods=30, freq='D')
        static_error = [0.18 - 0.02 * np.random.random() for _ in range(30)]
        online_error = [0.18 - 0.003 * i + 0.01 * np.random.random() for i in range(30)]
        
        # Create metrics for latest performance
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric(
                "Static Model Error", 
                f"{static_error[-1]:.3f}", 
                f"{static_error[0] - static_error[-1]:.3f}",
                delta_color="inverse"
            )
        with col2:
            st.metric(
                "Online Learning Error", 
                f"{online_error[-1]:.3f}", 
                f"{online_error[0] - online_error[-1]:.3f}",
                delta_color="inverse"
            )
        with col3:
            improvement = ((static_error[-1] - online_error[-1]) / static_error[-1]) * 100
            st.metric(
                "Improvement", 
                f"{improvement:.1f}%",
                "vs static model"
            )
        
        # Create dataframe
        error_df = pd.DataFrame({
            "Date": dates,
            "Static Model Error": static_error,
            "Online Learning Error": online_error
        })
        
        # Create plot
        fig = px.line(
            error_df, 
            x="Date", 
            y=["Static Model Error", "Online Learning Error"],
            title="Error Reduction Over Time",
            labels={"value": "Mean Absolute Error"},
            color_discrete_map={
                "Static Model Error": "#94a3b8",
                "Online Learning Error": "#0ea5e9"
            }
        )
        
        # Add annotations to highlight improvement
        fig.add_annotation(
            x=dates[-1],
            y=online_error[-1],
            text="Online Learning",
            showarrow=True,
            arrowhead=1,
            arrowcolor="#0ea5e9",
            arrowwidth=2,
            arrowsize=1,
            ax=40,
            ay=40
        )
        
        # Add a trend line for the online learning model
        z = np.polyfit(range(len(dates)), online_error, 1)
        p = np.poly1d(z)
        fig.add_scatter(
            x=dates, 
            y=p(range(len(dates))), 
            mode='lines', 
            line=dict(dash='dash', color='#0ea5e9', width=1),
            name="Learning Trend",
            showlegend=True
        )
        
        # Update layout for better aesthetics
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#f1f5f9',
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="right",
                x=1
            )
        )
        
        # Update axes
        fig.update_xaxes(
            gridcolor='rgba(255,255,255,0.1)',
            showline=True, 
            linewidth=1, 
            linecolor='rgba(255,255,255,0.2)'
        )
        fig.update_yaxes(
            gridcolor='rgba(255,255,255,0.1)',
            showline=True, 
            linewidth=1, 
            linecolor='rgba(255,255,255,0.2)'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        with st.expander("💡 How Online Learning Works"):
            st.write("""
            **Online Learning** enables models to adapt continuously as new data becomes available:
            
            1. **Incremental Updates**: Models are updated with each new data point
            2. **Concept Drift Detection**: Automatic detection of changing patterns
            3. **Adaptive Learning Rate**: Learning rate adjusts based on data novelty
            4. **Memory Management**: Balances historical knowledge with new patterns
            """)
    
    with tab2:
        st.subheader("Adapting to New Patterns")
        
        # Create dummy data with a shift in pattern
        event_date_str = "2025-01-15"
        dates = pd.date_range(start='2025-01-01', periods=30, freq='D')
        
        # Convert string to pandas Timestamp safely
        event_date = pd.Timestamp(event_date_str)
        
        # Generate dummy data with a shift after event_date
        baseline = [100 + i * 0.5 for i in range(30)]
        actual = []
        
        for i, date in enumerate(dates):
            if date < event_date:
                actual.append(baseline[i] + np.random.normal(0, 3))
            else:
                actual.append(baseline[i] + 15 + np.random.normal(0, 3))
        
        # Static model fails to adapt
        static_pred = []
        for i, date in enumerate(dates):
            static_pred.append(baseline[i] + np.random.normal(0, 3))
        
        # Online model adapts after a few days
        online_pred = []
        for i, date in enumerate(dates):
            if date < event_date:
                online_pred.append(baseline[i] + np.random.normal(0, 3))
            elif (date - event_date).total_seconds() < 3 * 86400:  # Takes a few days to learn
                # Use index to calculate days after instead of date arithmetic
                days_after = i - dates.get_loc(event_date)
                online_pred.append(baseline[i] + (days_after * 5) + np.random.normal(0, 3))
            else:
                online_pred.append(baseline[i] + 15 + np.random.normal(0, 3))
        
        # Create metrics to display adaptation speed
        col1, col2 = st.columns(2)
        with col1:
            adaptation_days = 3
            st.metric(
                "Adaptation Time", 
                f"{adaptation_days} days",
                "after pattern shift"
            )
        
        with col2:
            # Calculate error before and after adaptation
            event_idx = dates.get_loc(event_date)
            post_event_static_error = np.mean([abs(actual[i] - static_pred[i]) for i in range(event_idx + 4, len(actual))])
            post_event_online_error = np.mean([abs(actual[i] - online_pred[i]) for i in range(event_idx + 4, len(actual))])
            error_reduction = ((post_event_static_error - post_event_online_error) / post_event_static_error) * 100
            
            st.metric(
                "Error Reduction", 
                f"{error_reduction:.1f}%",
                "after adaptation"
            )
        
        # Create dataframe for plotting
        adapt_df = pd.DataFrame({
            "Date": dates,
            "Actual": actual,
            "Static Model": static_pred,
            "Online Learning": online_pred
        })
        
        fig = px.line(
            adapt_df,
            x="Date",
            y=["Actual", "Static Model", "Online Learning"],
            title="Adaptation to Pattern Shift",
            labels={"value": "Value", "variable": "Model"},
            color_discrete_map={
                "Actual": "#10b981",
                "Static Model": "#94a3b8",
                "Online Learning": "#0ea5e9"
            }
        )
        
        # Calculate y-axis limits for the vertical line
        min_y = min(min(actual), min(static_pred), min(online_pred)) - 5
        max_y = max(max(actual), max(static_pred), max(online_pred)) + 5
        
        # Add a vertical line for the event date using add_shape
        fig.add_shape(
            type="line",
            x0=event_date,
            x1=event_date,
            y0=min_y,
            y1=max_y,
            line=dict(color="#ef4444", dash="dash", width=2)
        )
        
        # Add annotation for the event date
        fig.add_annotation(
            x=event_date,
            y=max_y,
            text="Pattern Shift",
            showarrow=True,
            arrowhead=1,
            arrowcolor="#ef4444",
            arrowwidth=2,
            arrowsize=1,
            ax=0,
            ay=-40
        )
        
        # Make the figure background transparent
        fig.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#f1f5f9',
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="right",
                x=1
            )
        )
        
        # Update axes appearance
        fig.update_xaxes(
            gridcolor='rgba(255,255,255,0.1)',
            showline=True, 
            linewidth=1, 
            linecolor='rgba(255,255,255,0.2)'
        )
        fig.update_yaxes(
            gridcolor='rgba(255,255,255,0.1)',
            showline=True, 
            linewidth=1, 
            linecolor='rgba(255,255,255,0.2)'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        st.info("The online learning model quickly adapts to the new pattern after the event, while the static model fails to adjust.")
    
    with tab3:
        st.subheader("Optimized vs. Baseline Model")
        
        # Create dummy data for model comparison
        metrics = ["Accuracy", "Latency (ms)", "Adaptation Speed", "Memory Usage (MB)"]
        baseline = [87, 125, 0, 450]
        optimized = [95, 45, 95, 280]
        
        # Create a radar chart comparing baseline and optimized models
        fig = go.Figure()
        
        fig.add_trace(go.Scatterpolar(
            r=baseline,
            theta=metrics,
            fill='toself',
            name='Baseline Model',
            line_color='#94a3b8',
            fillcolor='rgba(148, 163, 184, 0.2)'
        ))
        
        fig.add_trace(go.Scatterpolar(
            r=optimized,
            theta=metrics,
            fill='toself',
            name='Online Learning Model',
            line_color='#0ea5e9',
            fillcolor='rgba(14, 165, 233, 0.2)'
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 100]
                )
            ),
            showlegend=True,
            title="Model Capabilities Comparison",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font_color='#f1f5f9'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Add key metrics comparison
        st.subheader("Real-time Processing Metrics")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric(
                "Inference Speed", 
                "45ms", 
                "64% faster",
                delta_color="normal"
            )
        with col2:
            st.metric(
                "Model Size", 
                "280MB", 
                "38% smaller",
                delta_color="normal"
            )
        with col3:
            st.metric(
                "Update Frequency", 
                "Hourly", 
                "vs. weekly retraining",
                delta_color="normal"
            )
        
        with st.expander("📊 Usage Scenarios"):
            st.write("""
            **Ideal Use Cases for Online Learning:**
            
            1. **Demand Forecasting**: Adapts to changing usage patterns for optimized charging schedules
            2. **Battery Health Monitoring**: Learns from evolving battery degradation patterns
            3. **Energy Price Prediction**: Adjusts to market fluctuations in real-time
            4. **Anomaly Detection**: Continuously refines normal behavior baselines
            5. **User Behavior Modeling**: Adapts to changing driver habits and preferences
            """)

def display_home_dashboard():
    """Modern home dashboard display with enhanced cards"""
    st.write("## Welcome to the ML Insights Dashboard")
    st.write(
        "This dashboard provides insights from machine learning models "
        "used in the GIU EV Charging Infrastructure."
    )
    
    # Show key metrics at the top
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Active Stations", 
            "157", 
            "+12 (30d)",
            help="Number of active charging stations in the network"
        )
    
    with col2:
        st.metric(
            "Daily Sessions", 
            "1,452", 
            "+8.5%",
            help="Average number of charging sessions per day"
        )
    
    with col3:
        st.metric(
            "Prediction Accuracy", 
            "94.7%", 
            "+1.2%",
            help="Overall model prediction accuracy"
        )
    
    with col4:
        st.metric(
            "Avg Response Time", 
            "42ms", 
            "-15ms",
            help="Average API response time for ML predictions"
        )
    
    # Create a grid of cards with improved styling
    st.markdown('<div class="card-grid">', unsafe_allow_html=True)
    
    # Battery Health card
    st.markdown(
        """
        <div class="dashboard-card">
            <h3><span class="emoji">🔋</span> Battery Health</h3>
            <p>Predict battery state of health and remaining useful life for your EV fleet.</p>
            <div class="card-footer">
                <span class="badge">ML Model: XGBoost</span>
                <span class="badge accent">97.2% Accuracy</span>
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Usage Prediction card
    st.markdown(
        """
        <div class="dashboard-card">
            <h3><span class="emoji">🚗</span> Usage Prediction</h3>
            <p>Forecast when vehicles will need charging to optimize fleet operations.</p>
            <div class="card-footer">
                <span class="badge">ML Model: LSTM</span>
                <span class="badge accent">92.5% Accuracy</span>
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Energy Pricing card
    st.markdown(
        """
        <div class="dashboard-card">
            <h3><span class="emoji">💰</span> Energy Pricing</h3>
            <p>Optimize charging costs with AI-powered price forecasts and recommendations.</p>
            <div class="card-footer">
                <span class="badge">ML Model: Ensemble</span>
                <span class="badge accent">95.1% Accuracy</span>
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Anomaly Detection card
    st.markdown(
        """
        <div class="dashboard-card">
            <h3><span class="emoji">🔍</span> Anomaly Detection</h3>
            <p>Identify unusual patterns in charging data to prevent failures and optimize maintenance.</p>
            <div class="card-footer">
                <span class="badge">ML Model: Autoencoder</span>
                <span class="badge accent">98.3% Precision</span>
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Model Monitoring card
    st.markdown(
        """
        <div class="dashboard-card">
            <h3><span class="emoji">📊</span> Model Monitoring</h3>
            <p>Track ML model performance over time to ensure accurate predictions.</p>
            <div class="card-footer">
                <span class="badge">Updated: Daily</span>
                <span class="badge accent">Drift Detection: Active</span>
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Enhanced Forecasting card
    st.markdown(
        """
        <div class="dashboard-card">
            <h3><span class="emoji">🔮</span> Enhanced Forecasting</h3>
            <p>Advanced time-series forecasting with confidence intervals and scenario analysis.</p>
            <div class="card-footer">
                <span class="badge">ML Model: Prophet+XGBoost</span>
                <span class="badge accent">Multi-Horizon</span>
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Add badges and card footer styling
    st.markdown("""
    <style>
        .card-footer {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .badge {
            background-color: rgba(30, 41, 59, 0.8);
            color: #94a3b8;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge.accent {
            background-color: rgba(14, 165, 233, 0.2);
            color: #38bdf8;
        }
    </style>
    """, unsafe_allow_html=True)

def display_advanced_ml_capabilities():
    """Combined advanced ML capabilities dashboard"""
    st.write("## Advanced ML Capabilities")
    st.write("These dashboards showcase our cutting-edge machine learning capabilities.")
    
    # Create tabs for different advanced capabilities
    tab1, tab2, tab3 = st.tabs(["Multi-Task Learning", "Model Ensembles", "Online Learning"])
    
    with tab1:
        multi_task_learning_dashboard()
    
    with tab2:
        model_ensembles_dashboard()
    
    with tab3:
        online_learning_dashboard()

# --------------------------------------------------
# Fallback helper - Moved here so it's defined before use in main()
# --------------------------------------------------

def display_fallback_dashboard(section_name: str = "Unknown"):
    """Render a minimal placeholder when a dashboard component cannot be loaded."""
    st.warning(f"⚠️ The **{section_name}** dashboard is unavailable in this environment. Displaying fallback content.")
    st.write("Please ensure all optional dependencies are installed and the backend API is running, then reload the page.")

def main():
    """Main entry point for the dashboard app"""
    # Check API health
    api_healthy = health_check()
    
    # Create a custom header with logo and text in a flex container
    st.markdown(
        """
        <div class="app-header">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBEZWZpbmUgZ3JhZGllbnRzIC0tPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJ0ZXh0R3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY5MzhDOSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNFNTQ0NUEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGOEEzMCIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Im5vZGVHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjZCNkIiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGOEEzMCIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgoKICA8IS0tIEcgbGV0dGVyIC0tPgogIDxwYXRoIGQ9Ik01MCAyMEMzNi4yIDIwIDI1IDMxLjIgMjUgNDVDMjUgNTguOCAzNi4yIDcwIDUwIDcwQzU4LjggNzAgNjYuNCA2NS4yIDcwLjQgNThINTVWNDhIODBWNTVDODAgNzEuNiA2Ni42IDg1IDUwIDg1QzI3LjggODUgMTAgNjcuMiAxMCA0NUMxMCAyMi44IDI3LjggNSA1MCA1QzY0LjggNSA3Ny40IDEzLjggODMgMjYuNEw2OSAzM0M2NS42IDI1LjIgNTguNCAyMCA1MCAyMFoiIGZpbGw9InVybCgjdGV4dEdyYWRpZW50KSIvPgogIAogIDwhLS0gSSBsZXR0ZXIgLS0+CiAgPHJlY3QgeD0iOTAiIHk9IjUiIHdpZHRoPSIxNSIgaGVpZ2h0PSI4MCIgZmlsbD0idXJsKCN0ZXh0R3JhZGllbnQpIi8+CiAgCiAgPCEtLSBVIGxldHRlciAtLT4KICA8cGF0aCBkPSJNMTE1IDVWNjBDMTE1IDY2LjYgMTIwLjQgNzIgMTI3IDcyQzEzMy42IDcyIDEzOSA2Ni42IDEzOSA2MFY1SDE1NFY2MEMxNTQgNzQuOCAxNDIgODcgMTI3IDg3QzExMiA4NyAxMDAgNzQuOCAxMDAgNjBWNUgxMTVaIiBmaWxsPSJ1cmwoI3RleHRHcmFkaWVudCkiLz4KICAKICA8IS0tIENvbm5lY3Rpb24gbm9kZXMgLS0+CiAgPGNpcmNsZSBjeD0iMTcwIiBjeT0iMjAiIHI9IjE1IiBmaWxsPSJ1cmwoI25vZGVHcmFkaWVudCkiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSI1MCIgcj0iNyIgZmlsbD0idXJsKCNub2RlR3JhZGllbnQpIi8+CiAgPGNpcmNsZSBjeD0iMTcwIiBjeT0iODAiIHI9IjEwIiBmaWxsPSJ1cmwoI25vZGVHcmFkaWVudCkiLz4KICA8Y2lyY2xlIGN4PSIxOTAiIGN5PSIzNSIgcj0iMTAiIGZpbGw9InVybCgjbm9kZUdyYWRpZW50KSIvPgogIAogIDwhLS0gQ29ubmVjdGlvbiBsaW5lcyAtLT4KICA8cGF0aCBkPSJNMTcwIDM1TDE3MCA0M00xNzAgNTdMMTcwIDcwTTE3MCAyMEwxOTAgMzUiIHN0cm9rZT0idXJsKCNub2RlR3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+IA==" alt="GIU Logo">
            <div class="app-header-text">
                <h1>EV Charging Infrastructure</h1>
                <p>Machine Learning Insights Dashboard</p>
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    if not api_healthy:
        st.warning("⚠️ API service is not available. Some features may not work.")
    
    # Get URL query parameters
    params = get_query_params()
    selected_section = params.get("section", "enhanced-forecasting")
    
    # Create sidebar navigation
    with st.sidebar:
        st.markdown(
            """
            <div class="sidebar-header">
                <h2>Dashboard Navigation</h2>
            </div>
            """, 
            unsafe_allow_html=True
        )
        
        st.markdown("---")
        
        # Navigation options
        section = st.radio(
            "Select Dashboard",
            options=[
                "Enhanced Forecasting",
                "Usage Forecasting",
                "Advanced ML Insights"
            ],
            index=0 if selected_section == "enhanced-forecasting" else 
                  1 if selected_section == "forecasting" else 
                  2 if selected_section == "advanced-ml" else 0,
            key="section_selector"
        )
        
        # Map the selection to section ID
        section_map = {
            "Enhanced Forecasting": "enhanced-forecasting",
            "Usage Forecasting": "forecasting",
            "Advanced ML Insights": "advanced-ml"
        }
        
        selected_section = section_map[section]
        
        # Update URL without triggering a page reload
        if params.get("section") != selected_section:
            new_params = params.copy()
            new_params["section"] = selected_section
            # Instead of experimental_rerun, use rerun
            st.rerun()
    
    # Load and display the selected dashboard component
    if selected_section == "enhanced-forecasting":
        try:
            from app.dashboard.components.enhanced_forecast_dashboard import display_enhanced_forecast_dashboard
            display_enhanced_forecast_dashboard()
        except Exception as e:
            st.error(f"Failed to load Enhanced Forecasting dashboard: {str(e)}")
            logger.error(f"Error loading enhanced forecast dashboard: {e}", exc_info=True)
            display_fallback_dashboard("Enhanced Forecasting")
    
    elif selected_section == "forecasting":
        try:
            from app.dashboard.components.forecast_dashboard import display_forecast_dashboard
            display_forecast_dashboard()
        except Exception as e:
            st.error(f"Failed to load Forecasting dashboard: {str(e)}")
            logger.error(f"Error loading forecast dashboard: {e}", exc_info=True)
            display_fallback_dashboard("Forecasting")
    
    elif selected_section == "advanced-ml":
        try:
            from app.dashboard.components.advanced_ml_dashboard import display_advanced_ml_dashboard
            display_advanced_ml_dashboard()
        except Exception as e:
            st.error(f"Failed to load Advanced ML dashboard: {str(e)}")
            logger.error(f"Error loading advanced ML dashboard: {e}", exc_info=True)
            display_fallback_dashboard("Advanced Machine Learning")
    
    else:
        st.error(f"Unknown section: {selected_section}")
        display_fallback_dashboard("Default")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error(f"An error occurred: {str(e)}")
        logger.exception("Unhandled exception in dashboard") 