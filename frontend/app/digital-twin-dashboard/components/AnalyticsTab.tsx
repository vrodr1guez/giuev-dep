"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart as BarChartIcon, TrendingUp, TrendingDown 
} from 'lucide-react';
import MetricCard from './MetricCard'; // Assuming MetricCard is in the same directory
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsTabProps {
  fleetComparison: any[];
  performanceHistory: any[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ fleetComparison, performanceHistory }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <BarChartIcon className="w-6 h-6 mr-3 text-indigo-400" />
          Fleet Performance Comparison (Before vs. After Optimization)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetComparison.map((item, index) => (
            <MetricCard 
              key={index} 
              title={item.metric}
              value={`${item.after.toFixed(item.unit === '%' || item.metric === 'Efficiency' ? 1 : 3)}${item.unit}`}
              icon={item.improvement > 0 ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
              trend={item.improvement > 0 ? 'up' : 'down'}
              trendValue={`${item.improvement.toFixed(1)}% improvement`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-pink-400" />
          Detailed Performance Metrics Over Time
        </h2>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceHistory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis yAxisId="left" stroke="#60a5fa" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#f472b6" fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none', borderRadius: '0.5rem' }} 
                labelStyle={{ color: '#e5e7eb' }} 
              />
              <Legend wrapperStyle={{ fontSize: '0.875rem', color: '#d1d5db' }} />
              <Line yAxisId="left" type="monotone" dataKey="power" stroke="#60a5fa" name="Power (kW)" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f472b6" name="Temperature (°C)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );
};

export default AnalyticsTab; 