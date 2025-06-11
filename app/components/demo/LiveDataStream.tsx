'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LiveDataStream() {
  const [liveData, setLiveData] = useState({
    batteryHealth: 94.8,
    chargingSessions: 247,
    energySaved: 12847,
    predictionsAccuracy: 96.3,
    activeTwins: 156
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        batteryHealth: prev.batteryHealth + (Math.random() - 0.5) * 0.1,
        chargingSessions: prev.chargingSessions + Math.floor(Math.random() * 3),
        energySaved: prev.energySaved + Math.floor(Math.random() * 50),
        predictionsAccuracy: 95 + Math.random() * 2,
        activeTwins: prev.activeTwins + Math.floor(Math.random() * 5)
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-xl rounded-xl p-4 text-white">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-bold">LIVE SYSTEM DATA</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Battery Health:</span>
          <motion.span 
            key={liveData.batteryHealth}
            initial={{ scale: 1.2, color: '#22c55e' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="font-mono"
          >
            {liveData.batteryHealth.toFixed(1)}%
          </motion.span>
        </div>
        
        <div className="flex justify-between">
          <span>Active Sessions:</span>
          <motion.span 
            key={liveData.chargingSessions}
            initial={{ scale: 1.2, color: '#3b82f6' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="font-mono"
          >
            {liveData.chargingSessions}
          </motion.span>
        </div>
        
        <div className="flex justify-between">
          <span>AI Accuracy:</span>
          <motion.span 
            key={liveData.predictionsAccuracy}
            initial={{ scale: 1.2, color: '#8b5cf6' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="font-mono"
          >
            {liveData.predictionsAccuracy.toFixed(1)}%
          </motion.span>
        </div>
      </div>
    </div>
  );
} 