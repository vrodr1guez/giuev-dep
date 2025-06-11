"""
Enhanced Forecast Dashboard Component

This module provides an enhanced Streamlit component for visualizing
time series forecasts with additional interactive features.
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

def display_enhanced_forecast_dashboard():
    """
    Display the enhanced forecasting dashboard component with interactive features.
    
    This component provides more advanced visualization options for forecasting data.
    """
    st.header("🔮 Enhanced Demand Forecasting")
    
    try:
        # Create filter options
        col1, col2, col3 = st.columns(3)
        
        with col1:
            forecast_days = st.slider("Forecast Horizon (Days)", 7, 60, 30)
        
        with col2:
            resolution = st.selectbox("Time Resolution", ["Hourly", "Daily", "Weekly"])
        
        with col3:
            confidence = st.checkbox("Show Confidence Intervals", True)
        
        # Generate sample data based on user selections
        start_date = datetime.now()
        end_date = start_date + timedelta(days=forecast_days)
        
        if resolution == "Hourly":
            freq = "H"
            periods = min(forecast_days * 24, 168)  # Limit to 7 days max for hourly to prevent overflow
        elif resolution == "Weekly":
            freq = "W"
            periods = (forecast_days // 7) + 1
        else:  # Daily
            freq = "D"
            periods = forecast_days
        
        dates = pd.date_range(start=start_date, end=end_date, freq=freq)
        
        # Create base forecast with seasonal pattern
        base = 100
        trend = np.linspace(0, 20, len(dates))
        
        # Add daily and weekly seasonality
        hour_effect = np.zeros(len(dates))
        day_effect = np.zeros(len(dates))
        
        for i, date in enumerate(dates):
            # Daily pattern (higher during day, lower at night)
            if resolution == "Hourly":
                hour = date.hour
                if 8 <= hour <= 20:
                    hour_effect[i] = 20 * np.sin(np.pi * (hour - 8) / 12)
            
            # Weekly pattern (lower on weekends)
            day = date.weekday()
            if day >= 5:  # Weekend
                day_effect[i] = -15
        
        # Combine all effects
        forecast = base + trend + hour_effect + day_effect
        
        # Add random noise
        np.random.seed(42)  # For reproducible results
        noise = np.random.normal(0, 5, len(dates))
        forecast = forecast + noise
        
        # Calculate confidence intervals
        lower_bound = forecast - np.linspace(5, 15, len(dates))
        upper_bound = forecast + np.linspace(5, 15, len(dates))
        
        # Create actual values (only for past dates)
        actual = []
        
        for date in dates:
            if date <= datetime.now():
                # Actual values close to forecast but with some variance
                idx = dates.get_loc(date)
                actual.append(forecast[idx] + np.random.normal(0, 3))
            else:
                actual.append(None)
        
        # Create dataframe
        df = pd.DataFrame({
            'Date': dates,
            'Forecast': forecast,
            'Actual': actual,
            'Lower Bound': lower_bound,
            'Upper Bound': upper_bound
        })
        
        # Create the plot
        fig = go.Figure()
        
        # Add actual values
        fig.add_trace(
            go.Scatter(
                x=df['Date'],
                y=df['Actual'],
                mode='markers+lines',
                name='Actual',
                line=dict(color='#2C3E50', width=3)
            )
        )
        
        # Add forecast
        fig.add_trace(
            go.Scatter(
                x=df['Date'],
                y=df['Forecast'],
                mode='lines',
                name='Forecast',
                line=dict(color='#3498DB', width=2)
            )
        )
        
        # Add confidence intervals if selected
        if confidence:
            fig.add_trace(
                go.Scatter(
                    x=df['Date'],
                    y=df['Upper Bound'],
                    mode='lines',
                    name='Upper Bound',
                    line=dict(width=0),
                    showlegend=False
                )
            )
            
            fig.add_trace(
                go.Scatter(
                    x=df['Date'],
                    y=df['Lower Bound'],
                    mode='lines',
                    name='Lower Bound',
                    line=dict(width=0),
                    fill='tonexty',
                    fillcolor='rgba(52, 152, 219, 0.2)',
                    showlegend=False
                )
            )
        
        # Update layout
        fig.update_layout(
            title=f"{resolution} Demand Forecast for Next {forecast_days} Days",
            xaxis_title="Date",
            yaxis_title="Energy Demand (kWh)",
            legend=dict(y=1.1, orientation='h'),
            template='plotly_dark',
            height=500
        )
        
        # Add vertical line for current time (using add_shape instead of add_vline for compatibility)
        now = datetime.now()
        
        fig.add_shape(
            type="line",
            x0=now,
            x1=now,
            y0=min(forecast) - 10,
            y1=max(forecast) + 10,
            line=dict(color="#E74C3C", width=2, dash="dash"),
        )
        
        fig.add_annotation(
            x=now,
            y=max(forecast) + 15,
            text="Current Time",
            showarrow=False,
            yshift=10
        )
        
        # Display the plot
        st.plotly_chart(fig, use_container_width=True)
        
        # Metrics row
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Average Demand", f"{df['Forecast'].mean():.1f} kWh")
        
        with col2:
            peak_value = df['Forecast'].max()
            peak_idx = df['Forecast'].idxmax()
            peak_time = df.loc[peak_idx, 'Date']
            st.metric("Peak Demand", f"{peak_value:.1f} kWh")
        
        with col3:
            forecast_accuracy = 92.5
            st.metric("Forecast Accuracy", f"{forecast_accuracy}%")
        
        with col4:
            error_variance = 7.8
            st.metric("Error Variance", f"{error_variance}")
        
        # Add forecast insights
        st.subheader("Forecast Insights")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.info(f"Peak demand expected on {peak_time.strftime('%Y-%m-%d %H:%M')} with {peak_value:.1f} kWh")
            
            # Weekly pattern visualization
            if resolution != "Hourly":
                st.write("Weekly Demand Pattern")
                weekly_pattern = pd.DataFrame({
                    'Day': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    'Demand': [100, 105, 103, 108, 110, 90, 85]
                })
                
                fig = px.bar(
                    weekly_pattern,
                    x='Day',
                    y='Demand',
                    title='Weekly Demand Pattern',
                    labels={'Demand': 'Avg. Demand (kWh)'}
                )
                
                st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Energy source mix chart
            st.write("Forecasted Energy Source Mix")
            
            energy_mix = pd.DataFrame({
                'Source': ['Solar', 'Wind', 'Grid', 'Storage'],
                'Percentage': [30, 25, 35, 10]
            })
            
            fig = px.pie(
                energy_mix,
                values='Percentage',
                names='Source',
                title='Energy Source Distribution',
                color_discrete_sequence=px.colors.sequential.Viridis
            )
            
            st.plotly_chart(fig, use_container_width=True)
    
    except Exception as e:
        logger.error(f"Error in enhanced forecast dashboard: {str(e)}")
        st.error(f"Error in enhanced forecast dashboard: {str(e)}")
        st.info("Using simplified visualization instead")
        
        # Create a simple fallback visualization
        try:
            st.subheader("Demand Forecast")
            
            # Generate simple dummy data
            days = list(range(1, 31))
            demand = [100 + day * 2 + np.random.randint(-10, 10) for day in days]
            
            # Create a dataframe
            simple_df = pd.DataFrame({
                "Day": days,
                "Demand (kWh)": demand
            })
            
            # Show a simple chart
            st.line_chart(simple_df.set_index("Day"))
        except Exception as fallback_error:
            st.error(f"Even fallback visualization failed: {str(fallback_error)}")
            st.write("Please contact technical support.")

# Make the component available when imported
if __name__ == "__main__":
    display_enhanced_forecast_dashboard() 