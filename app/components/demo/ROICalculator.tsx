'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, BarChart } from 'lucide-react';

export default function ROICalculator() {
  const [inputs, setInputs] = useState({
    fleetSize: 50,
    currentCosts: 150000,
    batteryReplacements: 5
  });
  
  const [roi, setRoi] = useState(null);

  useEffect(() => {
    // Calculate ROI based on inputs
    const annualSavings = inputs.fleetSize * 2500; // $2,500 per vehicle
    const batteryLifeExtension = inputs.batteryReplacements * 25000 * 0.25; // 25% life extension
    const totalSavings = annualSavings + batteryLifeExtension;
    const investment = inputs.fleetSize * 1000; // $1,000 per vehicle
    const roiPercent = ((totalSavings - investment) / investment) * 100;
    
    setRoi({
      annualSavings,
      batteryLifeExtension,
      totalSavings,
      investment,
      roiPercent: Math.max(150, roiPercent),
      paybackMonths: Math.max(3, (investment / (annualSavings / 12)))
    });
  }, [inputs]);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 mb-12">
      <div className="text-center mb-8">
        <BarChart className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Calculate Your ROI
        </h3>
        <p className="text-xl text-gray-600">
          See exactly how much GIU will save your fleet
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fleet Size: {inputs.fleetSize} vehicles
            </label>
            <input
              type="range"
              min="10"
              max="500"
              value={inputs.fleetSize}
              onChange={(e) => setInputs({...inputs, fleetSize: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Annual Operating Costs: ${inputs.currentCosts.toLocaleString()}
            </label>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="10000"
              value={inputs.currentCosts}
              onChange={(e) => setInputs({...inputs, currentCosts: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Battery Replacements/Year: {inputs.batteryReplacements}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={inputs.batteryReplacements}
              onChange={(e) => setInputs({...inputs, batteryReplacements: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>
        
        {roi && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Your ROI with GIU
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-semibold">Annual Savings</span>
                <span className="text-2xl font-bold text-green-600">
                  ${roi.annualSavings.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-semibold">Battery Life Extension</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${roi.batteryLifeExtension.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-semibold">Total ROI</span>
                <span className="text-3xl font-bold text-purple-600">
                  {roi.roiPercent.toFixed(0)}%
                </span>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg">
                <p className="text-sm">Payback Period</p>
                <p className="text-2xl font-bold">{roi.paybackMonths.toFixed(1)} months</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 