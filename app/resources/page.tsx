"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function ResourcesPage() {
  // Resource categories
  const categories = [
    { name: "Guides & Whitepapers", icon: "📚" },
    { name: "Webinars", icon: "🎥" },
    { name: "Research Reports", icon: "📊" },
    { name: "Industry News", icon: "📰" }
  ];

  // Resources data
  const resources = [
    {
      title: "EV Fleet Management Best Practices Guide",
      category: "Guides & Whitepapers",
      description: "Comprehensive guide to optimizing your EV fleet operations, maintenance schedules, and charging strategies.",
      image: "/images/resources/fleet-management-guide.jpg",
      date: "May 12, 2023",
      downloadType: "PDF"
    },
    {
      title: "Webinar: Maximizing ROI with Smart Charging Infrastructure",
      category: "Webinars",
      description: "Learn strategies to optimize your charging infrastructure investment and reduce operational costs.",
      image: "/images/resources/smart-charging-webinar.jpg",
      date: "June 23, 2023",
      downloadType: "Video"
    },
    {
      title: "The Future of V2G Technology: Market Outlook 2025",
      category: "Research Reports",
      description: "Comprehensive analysis of Vehicle-to-Grid technology trends, market projections, and implementation strategies.",
      image: "/images/resources/v2g-report.jpg",
      date: "April 5, 2023",
      downloadType: "PDF"
    },
    {
      title: "EV Charging Rate Optimization Strategies",
      category: "Guides & Whitepapers",
      description: "Tactical guide to optimizing charging schedules, taking advantage of TOU rates, and reducing energy costs.",
      image: "/images/resources/rate-optimization.jpg",
      date: "July 18, 2023",
      downloadType: "PDF"
    },
    {
      title: "Webinar: Implementing Smart Grid Integration for EV Fleets",
      category: "Webinars",
      description: "Technical deep dive into connecting your EV fleet with smart grid capabilities for optimal energy management.",
      image: "/images/resources/smart-grid-webinar.jpg",
      date: "March 30, 2023",
      downloadType: "Video"
    },
    {
      title: "Federal Incentives for EV Charging Infrastructure 2023",
      category: "Guides & Whitepapers",
      description: "Comprehensive guide to available federal tax credits, grants, and incentives for EV charging deployments.",
      image: "/images/resources/federal-incentives.jpg",
      date: "February 14, 2023",
      downloadType: "PDF"
    },
    {
      title: "Quarterly EV Industry Trends Report: Q2 2023",
      category: "Research Reports",
      description: "Analysis of the latest developments, market trends, and forecasts for the electric vehicle industry.",
      image: "/images/resources/q2-trends.jpg",
      date: "July 7, 2023",
      downloadType: "PDF"
    },
    {
      title: "Webinar: Optimizing Multi-Family Charging Solutions",
      category: "Webinars",
      description: "Strategies for property managers and developers to implement effective charging solutions in multi-family buildings.",
      image: "/images/resources/multi-family-webinar.jpg",
      date: "May 5, 2023",
      downloadType: "Video"
    }
  ];
  
  // Recommended resources
  const recommendedResources = resources.slice(0, 3);

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
            EV Charging Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Educational materials, research, and tools to help you optimize your EV charging operations
          </p>
        </motion.div>

        {/* Resource Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {categories.map((category, index) => (
            <div 
              key={index}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
            </div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search resources..." 
                  className="pl-10 w-full py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2 md:w-auto">
              <select className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Categories</option>
                {categories.map((category, i) => (
                  <option key={i}>{category.name}</option>
                ))}
              </select>
              
              <select className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Sort by: Newest</option>
                <option>Sort by: Oldest</option>
                <option>Sort by: Most Popular</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Featured Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recommended Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedResources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={resource.image} 
                    alt={resource.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">{resource.description}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{resource.date}</span>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
                      {resource.downloadType === "PDF" ? "Download PDF" : "Watch Webinar"}
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* All Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (index % 4) * 0.05 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
              >
                <div className="h-40 overflow-hidden">
                  <img 
                    src={resource.image} 
                    alt={resource.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-1">
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{resource.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2 flex-1">{resource.description}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{resource.date}</span>
                    <button className="px-3 py-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors flex items-center">
                      {resource.downloadType === "PDF" ? "Download" : "Watch"}
                      <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 md:p-12 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 md:pr-8 mb-6 md:mb-0">
              <h2 className="text-3xl font-bold text-white mb-4">Stay Updated on Industry Trends</h2>
              <p className="text-white/90 text-lg mb-2">
                Subscribe to our newsletter for the latest resources, industry insights, and best practices.
              </p>
              <p className="text-white/70 text-sm">
                We send monthly updates with valuable content tailored for EV infrastructure professionals.
              </p>
            </div>
            <div className="md:w-1/3 w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="mb-4">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-3 rounded-lg bg-white/90 border-0 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <button className="w-full bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-4 rounded-lg transition-colors">
                  Subscribe Now
                </button>
                <p className="text-white/70 text-xs mt-3 text-center">
                  We respect your privacy and will never share your information.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Additional Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-6 border border-blue-100 dark:border-blue-800">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Knowledge Base</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access our comprehensive knowledge base for detailed product documentation and FAQs.
              </p>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center">
                Browse Knowledge Base
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-6 border border-green-100 dark:border-green-800">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community Forum</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with other users, share experiences, and get advice from our community.
              </p>
              <a href="#" className="text-green-600 dark:text-green-400 hover:underline font-medium flex items-center">
                Join the Conversation
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-6 border border-purple-100 dark:border-purple-800">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upcoming Events</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Stay informed about our upcoming webinars, conferences, and industry events.
              </p>
              <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-medium flex items-center">
                View Events Calendar
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 