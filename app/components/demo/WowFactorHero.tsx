'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WowFactorHero() {
  const [currentStat, setCurrentStat] = useState(0);
  
  const comparisonStats = [
    {
      title: "Tesla's Autopilot",
      accuracy: "94.2%",
      our: "96.8%",
      advantage: "+2.6%",
      description: "Our battery AI beats Tesla's driving AI"
    },
    {
      title: "CATL Manufacturing",
      cells: "100M/year",
      our: "Digital twins for all",
      advantage: "∞ scale",
      description: "We optimize every battery ever made"
    },
    {
      title: "Industry Standard",
      prediction: "6 hours warning",
      our: "48 hours warning",
      advantage: "8x Earlier",
      description: "We predict failures days before they happen"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % comparisonStats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-12">
      <motion.div
        key={currentStat}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8 max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold mb-4">
          We Don't Just Beat Competitors...
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-red-200 text-sm">{comparisonStats[currentStat].title}</p>
            <p className="text-3xl font-black">{comparisonStats[currentStat].accuracy || comparisonStats[currentStat].cells || comparisonStats[currentStat].prediction}</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-yellow-300 text-4xl font-black">
              {comparisonStats[currentStat].advantage}
            </div>
          </div>
          <div>
            <p className="text-green-200 text-sm">GIU Intelligence</p>
            <p className="text-3xl font-black text-green-300">{comparisonStats[currentStat].our}</p>
          </div>
        </div>
        <p className="mt-4 text-xl font-semibold">{comparisonStats[currentStat].description}</p>
      </motion.div>
    </div>
  );
} 