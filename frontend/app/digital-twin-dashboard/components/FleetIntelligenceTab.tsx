"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Sparkles as Brain, Users, Compass as Target, Info, CheckCircle 
} from 'lucide-react';
import MetricCard from './MetricCard'; // Assuming MetricCard is in the same directory

interface FleetIntelligenceTabProps {
  fleetData: any;
  federatedInsights: any; // Consider defining a more specific type
}

const FleetIntelligenceTab: React.FC<FleetIntelligenceTabProps> = ({ fleetData, federatedInsights }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Brain className="w-6 h-6 mr-3 text-purple-400" />
          Federated Learning Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Global Model Accuracy" value={`${fleetData.model_update.accuracy_improvement.toFixed(1)}%`} icon={<Target className="w-6 h-6 text-purple-400" />} trend="up" trendValue={`${fleetData.model_update.accuracy_improvement > 40 ? 'Significant' : 'Moderate'} Gain`} />
          <MetricCard title="Convergence Rate" value={fleetData.model_update.convergence_rate.toFixed(2)} icon={<CheckCircle className="w-6 h-6 text-green-400" />} />
          <MetricCard title="Privacy Budget Used" value={`${(fleetData.model_update.privacy_budget_used * 100).toFixed(0)}%`} icon={<Brain className="w-6 h-6 text-yellow-400" />} />
          <MetricCard title="Global Model Version" value={fleetData.model_update.global_model_version} icon={<Info className="w-6 h-6 text-sky-400" />} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-blue-300 flex items-center">
          <Users className="w-6 h-6 mr-3 text-teal-400" />
          Overall Fleet Intelligence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Key Fleet Metrics</h3>
            <div className="space-y-3">
              {Object.entries(fleetData.fleet_insights).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={`font-medium text-sky-400`}>
                    {typeof value === 'number' ? value.toFixed(key.includes('consumption') ? 1 : (key.includes('potential') ? 1 : (key.includes('health') || key.includes('efficiency') ? 1 : 0))) : value}
                    {key.includes('consumption') ? ' kWh' : key.includes('potential') ? '%' : key.includes('health') || key.includes('efficiency') ? (key.includes('health') ? '%' : '') : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20 md:col-span-2">
            <h3 className="text-lg font-semibold text-teal-300 mb-4">Actionable Fleet Recommendations</h3>
            <ul className="space-y-3">
              {fleetData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                  <Info className="w-5 h-5 mr-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <span className="flex-1">{rec}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Implement Recommendations
                </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default FleetIntelligenceTab; 