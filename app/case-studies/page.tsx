"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      title: "City of Portland EV Fleet Transformation",
      category: "Public Sector",
      image: "/images/case-studies/portland-fleet.jpg",
      summary: "How Portland reduced operational costs by 40% while cutting emissions through strategic electrification of their municipal fleet.",
      results: [
        "40% reduction in operational costs",
        "75% decrease in fleet emissions",
        "95% reduction in maintenance downtime",
        "100% renewable energy charging integration"
      ]
    },
    {
      title: "GreenDrive Logistics: Last-Mile Delivery Revolution",
      category: "Logistics & Shipping",
      image: "/images/case-studies/greendrive-logistics.jpg",
      summary: "GreenDrive's transition to an all-electric last-mile delivery fleet and the implementation of our smart charging infrastructure.",
      results: [
        "82% reduction in delivery carbon footprint",
        "35% decrease in operational costs",
        "50% improvement in delivery efficiency",
        "20% boost in customer satisfaction"
      ]
    },
    {
      title: "MetroLink Transit: Electric Bus Network Implementation",
      category: "Public Transportation",
      image: "/images/case-studies/metrolink-transit.jpg",
      summary: "Creating a scalable EV charging infrastructure to support MetroLink's transition to an all-electric bus fleet.",
      results: [
        "100% renewable-powered charging network",
        "45% reduction in energy costs",
        "30% increase in route reliability",
        "Zero-downtime grid integration"
      ]
    },
    {
      title: "EcoProperty Management: Multi-Family Charging Solution",
      category: "Real Estate",
      image: "/images/case-studies/ecoproperty-management.jpg",
      summary: "Deploying accessible EV charging infrastructure across 50+ multi-family properties with integrated billing and management.",
      results: [
        "120% increase in property values",
        "95% tenant satisfaction with charging amenities",
        "65% increase in EV adoption among residents",
        "$420,000 in new annual revenue from charging services"
      ]
    },
    {
      title: "National Retail Chain: Customer Charging Network",
      category: "Retail",
      image: "/images/case-studies/retail-charging.jpg",
      summary: "Implementing a nationwide charging network across 200+ locations that increased customer dwell time and store revenue.",
      results: [
        "27% increase in shopper dwell time",
        "18% increase in average transaction value",
        "3.2M kWh clean energy delivered annually",
        "45% of users became loyalty program members"
      ]
    },
    {
      title: "TechCorp Campus: Workplace Charging Program",
      category: "Corporate",
      image: "/images/case-studies/techcorp-campus.jpg",
      summary: "Comprehensive workplace charging solution with employee benefits integration and smart energy management.",
      results: [
        "43% increase in EV adoption among employees",
        "92% employee satisfaction with charging program",
        "100% integration with renewable campus energy",
        "35% reduction in workplace transportation emissions"
      ]
    }
  ];

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
            Customer Success Stories
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-world implementations and results from organizations that transformed their EV operations with our platform
          </p>
        </motion.div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {caseStudies.map((study, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={study.image} 
                  alt={study.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {study.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{study.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">{study.summary}</p>
                <div className="mt-auto">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Key Results:</h4>
                  <ul className="space-y-1">
                    {study.results.slice(0, 2).map((result, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{result}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-4 w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                    Read Full Case Study
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Case Study */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 md:p-12 mb-16"
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="mb-4">
                <span className="px-3 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                  Featured Success Story
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                SmartFleet Delivery: Zero Emission Last-Mile Solution
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                SmartFleet Delivery transformed their entire last-mile delivery operation with our comprehensive EV fleet management platform, resulting in significant cost savings and environmental impact reduction.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">68%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Reduction in operational costs</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Zero emission deliveries</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">15k</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Deliveries per day</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">3.2M</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Annual CO₂ reduction (kg)</div>
                </div>
              </div>
              
              <blockquote className="italic border-l-4 border-blue-500 pl-4 py-2 text-gray-600 dark:text-gray-300 mb-6">
                "The GIU EV Charging Infrastructure platform revolutionized how we manage our fleet. We've not only reduced our carbon footprint but significantly improved our operational efficiency."
                <footer className="mt-2 font-medium text-gray-700 dark:text-gray-200">
                  — Sarah Johnson, COO at SmartFleet Delivery
                </footer>
              </blockquote>
              
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center">
                Read the Full Story
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            
            <div className="md:w-1/2">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/images/case-studies/smartfleet-main.jpg" 
                  alt="SmartFleet Delivery case study"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="/images/case-studies/smartfleet-1.jpg" 
                    alt="Case study gallery 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="/images/case-studies/smartfleet-2.jpg" 
                    alt="Case study gallery 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="/images/case-studies/smartfleet-3.jpg" 
                    alt="Case study gallery 3"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to become our next success story?</h2>
          <p className="text-xl opacity-90 mb-6 max-w-3xl mx-auto">
            Join these leading organizations and transform your EV operations with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/schedule-demo" 
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-shadow"
            >
              Schedule a Demo
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 bg-indigo-500/30 backdrop-blur-sm border border-white/30 text-white rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-shadow"
            >
              Contact Sales
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 