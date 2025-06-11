"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string | number;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon, trend, trendValue, color = "blue" }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-blue-500/20">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-blue-400 mt-1">
          {value}{unit && <span className="text-lg text-gray-400 ml-1">{unit}</span>}
        </p>
      </div>
    </motion.div>
  );
};

export default MetricCard; 