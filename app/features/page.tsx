"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            EV Charging Platform Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive tools for managing and optimizing your EV charging infrastructure
          </p>
        </motion.div>

        {/* Feature Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Fleet Management",
              description: "Monitor and manage your entire EV fleet with real-time insights and controls.",
              icon: "🚗",
              delay: 0.1
            },
            {
              title: "Charging Infrastructure",
              description: "Deploy, monitor, and optimize your charging stations across multiple locations.",
              icon: "⚡",
              delay: 0.2
            },
            {
              title: "Smart Grid Integration",
              description: "Participate in energy markets and optimize charging based on grid conditions.",
              icon: "🔌",
              delay: 0.3
            }
          ].map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: category.delay }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{category.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {category.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Features List */}
        <div className="mb-20">
          {[
            {
              title: "Fleet Management",
              features: [
                "Real-time vehicle tracking and monitoring",
                "Battery health and state of charge monitoring",
                "Predictive maintenance alerts",
                "Driver behavior analysis",
                "Route optimization for maximum efficiency",
                "Detailed reporting and analytics",
                "Vehicle assignment and scheduling"
              ]
            },
            {
              title: "Charging Infrastructure",
              features: [
                "Charging station health monitoring",
                "Usage analytics and optimization",
                "Automated billing and payment processing",
                "Maintenance scheduling and alerts",
                "Remote diagnostics and troubleshooting",
                "Access control and security features",
                "Load balancing and demand management"
              ]
            },
            {
              title: "Smart Grid Integration",
              features: [
                "Real-time energy market participation",
                "Vehicle-to-Grid (V2G) capabilities",
                "Demand response program integration",
                "Time-of-use charging optimization",
                "Renewable energy integration",
                "Energy cost optimization algorithms",
                "Grid stability and frequency regulation services"
              ]
            },
            {
              title: "User Experience",
              features: [
                "Mobile app for drivers and fleet managers",
                "Customizable dashboards and reporting",
                "Role-based access control",
                "White-label branding options",
                "Seamless integration with existing systems",
                "API access for custom integrations",
                "Multi-language support"
              ]
            }
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 mb-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.features.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex}
                    className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to transform your EV charging operations?</h2>
          <p className="text-xl opacity-90 mb-6 max-w-3xl mx-auto">
            Schedule a demo today and see how our platform can help you optimize your EV infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/schedule-demo" 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-shadow"
            >
              Schedule a Demo
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 bg-blue-500/30 backdrop-blur-sm border border-white/30 text-white rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-shadow"
            >
              Contact Sales
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 