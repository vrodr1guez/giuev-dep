import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiActivity, FiDollarSign, FiTrendingUp, FiCpu } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import PredictionPanel from './PredictionPanel';
import MetricCard from './MetricCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardContainer = styled.div`
  width: 100%;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--shadow);
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

function Dashboard({ activeSection }) {
  const [metrics, setMetrics] = useState({
    avgUsage: 1.08,
    avgPrice: 25.43,
    accuracy: 94.5,
    activeModels: 2
  });

  const [chartData, setChartData] = useState({
    usage: null,
    price: null
  });

  useEffect(() => {
    // Simulate real-time data
    const interval = setInterval(() => {
      setMetrics(prev => ({
        avgUsage: prev.avgUsage + (Math.random() - 0.5) * 0.1,
        avgPrice: prev.avgPrice + (Math.random() - 0.5) * 2,
        accuracy: Math.min(100, Math.max(90, prev.accuracy + (Math.random() - 0.5) * 1)),
        activeModels: 2
      }));
    }, 5000);

    // Generate chart data
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const usageData = hours.map(() => Math.random() * 5);
    const priceData = hours.map(() => 15 + Math.random() * 30);

    setChartData({
      usage: {
        labels: hours,
        datasets: [{
          label: 'Usage Prediction (kWh)',
          data: usageData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      price: {
        labels: hours,
        datasets: [{
          label: 'Price Prediction ($/MWh)',
          data: priceData,
          backgroundColor: '#2563eb',
          borderColor: '#2563eb',
          borderRadius: 8
        }]
      }
    });

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>EV Charging ML Dashboard</Title>
        <Subtitle>Real-time predictions and analytics for EV charging infrastructure</Subtitle>
      </DashboardHeader>

      <MetricsGrid>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricCard
            icon={<FiActivity />}
            title="Average Usage"
            value={`${metrics.avgUsage.toFixed(2)} kWh`}
            trend="+5.2%"
            color="#10b981"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricCard
            icon={<FiDollarSign />}
            title="Average Price"
            value={`$${metrics.avgPrice.toFixed(2)}`}
            trend="-2.1%"
            color="#2563eb"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MetricCard
            icon={<FiTrendingUp />}
            title="Model Accuracy"
            value={`${metrics.accuracy.toFixed(1)}%`}
            trend="+0.5%"
            color="#f59e0b"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MetricCard
            icon={<FiCpu />}
            title="Active Models"
            value={metrics.activeModels}
            trend="Stable"
            color="#ef4444"
          />
        </motion.div>
      </MetricsGrid>

      <ChartsGrid>
        {chartData.usage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ChartCard>
              <ChartTitle>Usage Predictions (24h)</ChartTitle>
              <Line data={chartData.usage} options={chartOptions} />
            </ChartCard>
          </motion.div>
        )}
        {chartData.price && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ChartCard>
              <ChartTitle>Price Predictions (24h)</ChartTitle>
              <Bar data={chartData.price} options={chartOptions} />
            </ChartCard>
          </motion.div>
        )}
      </ChartsGrid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <PredictionPanel />
      </motion.div>
    </DashboardContainer>
  );
}

export default Dashboard; 