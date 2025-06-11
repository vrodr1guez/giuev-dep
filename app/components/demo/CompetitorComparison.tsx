'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Shield, TrendingUp } from 'lucide-react';

export default function CompetitorComparison() {
  const competitors = [
    {
      name: "Tesla",
      logo: "🚗",
      theirBest: "Supercharger Network",
      ourAdvantage: "Digital Twin Technology",
      advantage: "Predicts failures 48h early",
      score: { theirs: 85, ours: 96 }
    },
    {
      name: "CATL",
      logo: "🔋",
      theirBest: "Battery Manufacturing",
      ourAdvantage: "Cell-Level AI",
      advantage: "Optimizes every individual cell",
      score: { theirs: 82, ours: 94 }
    },
    {
      name: "ChargePoint",
      logo: "⚡",
      theirBest: "Charging Stations",
      ourAdvantage: "Smart Grid Integration",
      advantage: "35% cost savings vs 10%",
      score: { theirs: 78, ours: 92 }
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-indigo-900 text-white rounded-2xl p-8 mb-12">
      <div className="text-center mb-8">
        <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-4xl font-bold mb-4">
          Why We Beat Industry Leaders
        </h3>
        <p className="text-xl text-indigo-200">
          Not just better. Fundamentally different.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {competitors.map((comp, index) => (
          <motion.div
            key={comp.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{comp.logo}</div>
              <h4 className="text-2xl font-bold">{comp.name}</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-indigo-200">Their Best Feature</p>
                <p className="font-semibold">{comp.theirBest}</p>
              </div>
              
              <div>
                <p className="text-sm text-green-200">Our Advantage</p>
                <p className="font-bold text-green-300">{comp.ourAdvantage}</p>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-yellow-300 font-bold text-center">
                  {comp.advantage}
                </p>
              </div>
              
              <div className="flex justify-between text-center">
                <div>
                  <p className="text-2xl font-bold text-red-300">{comp.score.theirs}</p>
                  <p className="text-xs text-gray-300">Them</p>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-300">{comp.score.ours}</p>
                  <p className="text-xs text-gray-300">Us</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 