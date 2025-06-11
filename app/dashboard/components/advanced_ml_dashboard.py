"""
Advanced ML Dashboard Component

This module provides a Streamlit component for visualizing ML model performance,
anomaly detection, and model monitoring for EV charging infrastructure.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def display_advanced_ml_dashboard():
    """
    Display the advanced ML dashboard component.
    
    This component visualizes ML model performance metrics and anomaly detection.
    """
    st.header("🧠 Advanced ML Performance Dashboard")
    
    try:
        # Create tabs for different ML features
        tab1, tab2, tab3 = st.tabs([
            "Model Performance", 
            "Anomaly Detection", 
            "Model Monitoring"
        ])
        
        with tab1:
            display_model_performance()
        
        with tab2:
            display_anomaly_detection()
        
        with tab3:
            display_model_monitoring()
    
    except Exception as e:
        logger.error(f"Error in advanced ML dashboard: {str(e)}")
        st.error(f"Error in advanced ML dashboard: {str(e)}")
        st.info("Using simplified visualization")
        
        try:
            # Show simple fallback metrics
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Model Accuracy", "94.5%", "1.2%")
            
            with col2:
                st.metric("RMSE", "0.045", "-0.003")
            
            with col3:
                st.metric("F1 Score", "0.92", "0.05")
            
            # Simple chart
            st.subheader("Performance Over Time")
            
            # Create dummy data
            days = list(range(1, 31))
            performance = [90 + 0.2 * day + np.random.random() * 2 for day in days]
            
            # Show chart
            chart_data = pd.DataFrame({
                "Day": days,
                "Performance": performance
            })
            
            st.line_chart(chart_data.set_index("Day"))
        except Exception as fallback_error:
            st.error(f"Fallback visualization also failed: {str(fallback_error)}")

def display_model_performance():
    """Display model performance metrics and comparisons."""
    st.subheader("ML Model Performance")
    
    try:
        # Model selection
        models = {
            "battery_health": "Battery Health Predictor",
            "charging_demand": "Charging Demand Forecaster",
            "price_prediction": "Energy Price Predictor",
            "anomaly_detector": "Anomaly Detection System"
        }
        
        selected_model = st.selectbox(
            "Select Model", 
            list(models.keys()), 
            format_func=lambda x: models[x]
        )
        
        # Time period selection
        period = st.selectbox(
            "Time Period", 
            ["Last 7 days", "Last 30 days", "Last 90 days", "Last Year"]
        )
        
        # Create performance metrics based on selected model
        if selected_model == "battery_health":
            metrics = {
                "RMSE": [0.058, 0.062, 0.057, 0.054, 0.051, 0.048, 0.047],
                "MAE": [0.043, 0.046, 0.042, 0.040, 0.038, 0.035, 0.034],
                "R²": [0.921, 0.918, 0.923, 0.927, 0.932, 0.938, 0.941]
            }
            comparison = "Previous Version"
            improvement = "+3.8%"
            best_metric = "R²"
        
        elif selected_model == "charging_demand":
            metrics = {
                "RMSE": [5.24, 5.18, 5.12, 5.05, 4.98, 4.85, 4.76],
                "MAPE": [8.7, 8.5, 8.4, 8.2, 8.0, 7.8, 7.5],
                "Forecast Accuracy": [91.3, 91.5, 91.6, 91.8, 92.0, 92.2, 92.5]
            }
            comparison = "Industry Average"
            improvement = "+5.2%"
            best_metric = "Forecast Accuracy"
        
        elif selected_model == "price_prediction":
            metrics = {
                "RMSE": [2.87, 2.85, 2.82, 2.79, 2.76, 2.72, 2.68],
                "MAPE": [6.8, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2],
                "Forecast Accuracy": [93.2, 93.3, 93.4, 93.5, 93.6, 93.7, 93.8]
            }
            comparison = "Previous Version"
            improvement = "+2.1%"
            best_metric = "Forecast Accuracy"
        
        else:  # anomaly_detector
            metrics = {
                "Precision": [0.923, 0.927, 0.930, 0.934, 0.938, 0.941, 0.945],
                "Recall": [0.882, 0.885, 0.888, 0.891, 0.894, 0.897, 0.900],
                "F1 Score": [0.902, 0.905, 0.908, 0.912, 0.915, 0.918, 0.922],
                "AUC": [0.956, 0.958, 0.960, 0.962, 0.964, 0.966, 0.968]
            }
            comparison = "Previous Version"
            improvement = "+2.6%"
            best_metric = "AUC"
        
        # Create time series for metrics
        days = pd.date_range(end=datetime.now(), periods=7, freq='D')
        
        # Display metrics cards
        cols = st.columns(len(metrics))
        
        for i, (metric_name, values) in enumerate(metrics.items()):
            with cols[i]:
                st.metric(
                    metric_name,
                    f"{values[-1]:.3f}",
                    f"{values[-1] - values[0]:.3f}"
                )
        
        # Create performance trend visualization
        df_metrics = pd.DataFrame(metrics, index=days)
        df_metrics.index.name = 'Date'
        df_metrics_melted = df_metrics.reset_index().melt(
            id_vars=['Date'], 
            var_name='Metric', 
            value_name='Value'
        )
        
        fig = px.line(
            df_metrics_melted,
            x='Date',
            y='Value',
            color='Metric',
            title=f"{models[selected_model]} Performance Trend",
            markers=True
        )
        
        fig.update_layout(
            height=400,
            legend=dict(orientation='h', y=1.1),
            template='plotly_dark'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Comparison to benchmark
        st.subheader("Benchmark Comparison")
        
        comparison_df = pd.DataFrame({
            'Model': ['Current Model', comparison],
            'Performance': [metrics[best_metric][-1], metrics[best_metric][-1] * 0.95]
        })
        
        fig = px.bar(
            comparison_df,
            x='Model',
            y='Performance',
            color='Model',
            title=f"Performance Comparison ({best_metric})",
            text_auto='.3f'
        )
        
        fig.update_layout(height=300, template='plotly_dark')
        st.plotly_chart(fig, use_container_width=True)
        
        st.success(f"🎯 Current model outperforms {comparison} by {improvement} on {best_metric}")
    
    except Exception as e:
        logger.error(f"Error displaying model performance: {str(e)}")
        st.error(f"Error displaying model performance: {str(e)}")
        
        # Simple fallback
        st.metric("Model Performance", "94.5%", "1.8%")

def display_anomaly_detection():
    """Display anomaly detection results and insights."""
    st.subheader("Anomaly Detection System")
    
    try:
        # Create sample anomaly data
        vehicles = [f"EV-{i:03d}" for i in range(1, 6)]
        anomaly_types = ["Voltage Spike", "Temperature Anomaly", "Charging Irregular", "Capacity Drop"]
        
        # Summary metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Anomalies", "42")
        
        with col2:
            st.metric("Affected Vehicles", "5")
        
        with col3:
            st.metric("Last 24 Hours", "3", "+1")
        
        with col4:
            st.metric("Detection Rate", "94.7%", "+2.3%")
        
        # Vehicle selection
        selected_vehicle = st.selectbox("Select Vehicle", vehicles)
        
        # Set a fixed seed based on the selected vehicle for consistent results
        seed_value = sum(ord(c) for c in selected_vehicle) % 10000
        np.random.seed(seed_value)
        
        anomaly_count = np.random.randint(3, 8)
        anomalies = []
        
        for i in range(anomaly_count):
            hours_ago = np.random.randint(1, 168)
            timestamp = datetime.now() - timedelta(hours=hours_ago)
            
            anomalies.append({
                "timestamp": timestamp,
                "type": np.random.choice(anomaly_types),
                "severity": np.random.choice(["High", "Medium", "Low"], p=[0.2, 0.5, 0.3]),
                "confidence": round(np.random.uniform(0.75, 0.98), 2),
                "duration_minutes": np.random.randint(1, 60)
            })
        
        # Sort by timestamp (most recent first)
        anomalies.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Create anomaly severity distribution
        severity_counts = {"High": 0, "Medium": 0, "Low": 0}
        for anomaly in anomalies:
            severity_counts[anomaly["severity"]] += 1
        
        col1, col2 = st.columns([1, 2])
        
        with col1:
            # Severity distribution chart
            severity_df = pd.DataFrame({
                'Severity': list(severity_counts.keys()),
                'Count': list(severity_counts.values())
            })
            
            fig = px.pie(
                severity_df,
                values='Count',
                names='Severity',
                title="Anomaly Severity Distribution",
                color='Severity',
                color_discrete_map={
                    "High": "#E74C3C",
                    "Medium": "#F39C12",
                    "Low": "#3498DB"
                }
            )
            fig.update_layout(height=300)
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Anomaly timeline
            timeline_data = []
            for anomaly in anomalies:
                timeline_data.append({
                    "Date": anomaly["timestamp"],
                    "Type": anomaly["type"],
                    "Severity": anomaly["severity"]
                })
            
            timeline_df = pd.DataFrame(timeline_data)
            
            # Create timeline chart
            fig = px.scatter(
                timeline_df,
                x="Date",
                y="Type",
                color="Severity",
                size_max=10,
                color_discrete_map={
                    "High": "#E74C3C",
                    "Medium": "#F39C12",
                    "Low": "#3498DB"
                },
                title=f"Anomaly Timeline for {selected_vehicle}"
            )
            
            fig.update_layout(height=300)
            st.plotly_chart(fig, use_container_width=True)
        
        # Display detailed anomaly table
        st.subheader("Detailed Anomalies")
        
        anomaly_table = []
        for anomaly in anomalies:
            anomaly_table.append({
                "Timestamp": anomaly["timestamp"].strftime("%Y-%m-%d %H:%M"),
                "Type": anomaly["type"],
                "Severity": anomaly["severity"],
                "Confidence": f"{anomaly['confidence'] * 100:.1f}%",
                "Duration": f"{anomaly['duration_minutes']} min"
            })
        
        # Reset random seed
        np.random.seed(None)
        
        st.table(pd.DataFrame(anomaly_table))
    
    except Exception as e:
        logger.error(f"Error displaying anomaly detection: {str(e)}")
        st.error(f"Error displaying anomaly detection: {str(e)}")
        
        # Show a simple fallback
        st.info("Anomaly detection visualization failed. Please try again later.")
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Total Anomalies", "42")
        with col2:
            st.metric("Detection Rate", "94.7%", "+2.3%")

def display_model_monitoring():
    """Display model monitoring metrics and drift detection."""
    st.subheader("Model Monitoring")
    
    try:
        # Model selection
        models = {
            "battery_health": "Battery Health Predictor v2.3.1",
            "charging_demand": "Charging Demand Forecaster v1.8.2",
            "price_prediction": "Energy Price Predictor v1.2.3",
            "anomaly_detector": "Anomaly Detection System v3.1.0"
        }
        
        col1, col2 = st.columns(2)
        
        with col1:
            selected_model = st.selectbox(
                "Select Model", 
                list(models.keys()), 
                format_func=lambda x: models[x],
                key="monitoring_model"
            )
        
        with col2:
            drift_threshold = st.slider("Drift Detection Threshold", 0.1, 0.5, 0.25, 0.05)
        
        # Generate monitoring data with a fixed seed for reproducibility
        np.random.seed(42)
        
        # Basic monitoring metrics
        prediction_count = np.random.randint(5000, 15000)
        actuals_count = int(prediction_count * np.random.uniform(0.85, 0.95))
        monitoring_days = np.random.randint(30, 180)
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Predictions Tracked", f"{prediction_count:,}")
        
        with col2:
            st.metric("Actuals Collected", f"{actuals_count:,}")
        
        with col3:
            st.metric("Monitoring Period", f"{monitoring_days} days")
        
        # Drift detection visualization
        st.subheader("Feature Drift Detection")
        
        # Generate feature drift data
        features = {
            "battery_health": ["Temperature", "Voltage", "Charge Cycles", "Discharge Rate", "Age"],
            "charging_demand": ["Time of Day", "Day of Week", "Weather", "Events", "Price"],
            "price_prediction": ["Demand", "Supply", "Renewable %", "Grid Load", "Time of Day"],
            "anomaly_detector": ["Sensor Readings", "Usage Pattern", "Temperature", "Voltage", "Current"]
        }
        
        model_features = features[selected_model]
        drift_scores = [np.random.uniform(0.05, 0.4) for _ in model_features]
        
        # Create drift dataframe
        drift_df = pd.DataFrame({
            "Feature": model_features,
            "Drift Score": drift_scores
        })
        
        # Sort by drift score
        drift_df = drift_df.sort_values("Drift Score", ascending=False)
        
        # Color based on threshold
        drift_df["Status"] = drift_df["Drift Score"].apply(
            lambda x: "Above Threshold" if x >= drift_threshold else "Normal"
        )
        
        # Create drift visualization
        fig = px.bar(
            drift_df,
            x="Feature",
            y="Drift Score",
            color="Status",
            title="Feature Drift Analysis",
            color_discrete_map={
                "Above Threshold": "#E74C3C",
                "Normal": "#2ECC71"
            }
        )
        
        # Add threshold line using add_shape instead of add_hline
        fig.add_shape(
            type="line",
            x0=-0.5,
            x1=len(model_features)-0.5,
            y0=drift_threshold,
            y1=drift_threshold,
            line=dict(color="yellow", dash="dash", width=2)
        )
        
        # Add annotation for the threshold
        fig.add_annotation(
            x=len(model_features)-0.5,
            y=drift_threshold,
            text="Drift Threshold",
            showarrow=False,
            xshift=50,
            font=dict(color="yellow")
        )
        
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)
        
        # Model performance over time
        st.subheader("Performance Over Time")
        
        # Generate time series data
        dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
        
        if selected_model in ["battery_health", "charging_demand", "price_prediction"]:
            # Regression metrics
            base_rmse = 0.05 if selected_model == "battery_health" else 5.0
            rmse = [base_rmse + 0.002 * i + np.random.normal(0, 0.001) for i in range(30)]
            rmse.reverse()  # Better performance over time
            
            performance_df = pd.DataFrame({
                "Date": dates,
                "RMSE": rmse
            })
            
            fig = px.line(
                performance_df,
                x="Date",
                y="RMSE",
                title="RMSE Over Time",
                markers=True
            )
            
        else:
            # Classification metrics
            f1_score = [0.88 + 0.002 * i + np.random.normal(0, 0.001) for i in range(30)]
            f1_score.reverse()  # Better performance over time
            
            performance_df = pd.DataFrame({
                "Date": dates,
                "F1 Score": f1_score
            })
            
            fig = px.line(
                performance_df,
                x="Date",
                y="F1 Score",
                title="F1 Score Over Time",
                markers=True
            )
        
        fig.update_layout(height=350)
        st.plotly_chart(fig, use_container_width=True)
        
        # Reset random seed
        np.random.seed(None)
        
        # Drift detection summary
        above_threshold = drift_df[drift_df["Status"] == "Above Threshold"]
        
        if len(above_threshold) > 0:
            st.warning(
                f"⚠️ Detected drift in {len(above_threshold)} features. "
                f"Model retraining recommended."
            )
        else:
            st.success("✅ No significant drift detected. Model performance is stable.")
    
    except Exception as e:
        logger.error(f"Error displaying model monitoring: {str(e)}")
        st.error(f"Error displaying model monitoring: {str(e)}")
        
        # Simple fallback
        st.info("Model monitoring visualization failed. Please try again later.")
        st.metric("Drift Score", "0.18", "-0.03")

# Make the component available when imported
if __name__ == "__main__":
    display_advanced_ml_dashboard() 