"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Download, FileText, MoreHorizontal, ArrowRight } from 'lucide-react';

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample contract data
  const contracts = [
    { 
      id: 'CTR-2023-1254',
      name: 'City of Portland Fleet Services', 
      type: 'Municipal',
      startDate: 'Jan 15, 2023',
      endDate: 'Jan 14, 2025',
      value: '$1,250,000',
      status: 'Active',
      chargingPoints: 45,
      renewalOption: true
    },
    { 
      id: 'CTR-2023-0892',
      name: 'GreenDrive Logistics', 
      type: 'Commercial',
      startDate: 'Mar 01, 2023',
      endDate: 'Feb 28, 2026',
      value: '$2,850,000',
      status: 'Active',
      chargingPoints: 78,
      renewalOption: true
    },
    { 
      id: 'CTR-2023-1103',
      name: 'Metro Transit Authority', 
      type: 'Public Transportation',
      startDate: 'Apr 12, 2023',
      endDate: 'Apr 11, 2028',
      value: '$4,500,000',
      status: 'Active',
      chargingPoints: 120,
      renewalOption: true
    },
    { 
      id: 'CTR-2022-0654',
      name: 'EcoProperty Residences', 
      type: 'Residential',
      startDate: 'Nov 01, 2022',
      endDate: 'Oct 31, 2025',
      value: '$875,000',
      status: 'Active',
      chargingPoints: 32,
      renewalOption: true
    },
    { 
      id: 'CTR-2022-0421',
      name: 'ValueMart Retail Chain', 
      type: 'Retail',
      startDate: 'Sep 15, 2022',
      endDate: 'Sep 14, 2024',
      value: '$1,750,000',
      status: 'Active',
      chargingPoints: 65,
      renewalOption: false
    },
    { 
      id: 'CTR-2023-0147',
      name: 'TechCorp Inc', 
      type: 'Corporate',
      startDate: 'Feb 01, 2023',
      endDate: 'Jan 31, 2026',
      value: '$1,950,000',
      status: 'Active',
      chargingPoints: 42,
      renewalOption: true
    },
    { 
      id: 'CTR-2022-0985',
      name: 'Southside Medical Center', 
      type: 'Healthcare',
      startDate: 'Dec 01, 2022',
      endDate: 'Nov 30, 2025',
      value: '$1,100,000',
      status: 'Active',
      chargingPoints: 28,
      renewalOption: true
    },
    { 
      id: 'CTR-2021-0774',
      name: 'Alpine Hotels Group', 
      type: 'Hospitality',
      startDate: 'Jul 01, 2021',
      endDate: 'Jun 30, 2023',
      value: '$925,000',
      status: 'Renewal Due',
      chargingPoints: 36,
      renewalOption: true
    }
  ];

  // Filter contracts based on search term
  const filteredContracts = contracts.filter(contract => 
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/ev-management" className="hover:text-blue-600 dark:hover:text-blue-400">EV Management</a>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-gray-200">Contracts</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage and monitor all your EV charging service agreements in one place
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search contracts..." 
                className="pl-10 w-full py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <Calendar className="h-4 w-4" />
                <span>Date Range</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <FileText className="h-4 w-4" />
                <span>New Contract</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Contracts Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden mb-8"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Charging Points</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredContracts.map((contract, index) => (
                  <tr 
                    key={contract.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{contract.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{contract.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contract.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {contract.startDate} - {contract.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">{contract.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contract.status === 'Active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
                        }`}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contract.chargingPoints}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredContracts.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No contracts found matching your search criteria.
            </div>
          )}
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contract Value</h3>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">$15.2M</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total value of active contracts</p>
            <div className="mt-4 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded">
              <div className="h-1 w-3/4 bg-blue-500 rounded"></div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Municipal: 35%</span>
              <span>Commercial: 45%</span>
              <span>Other: 20%</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Charging Points</h3>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">446</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total charging points under contract</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <div className="h-12 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center text-xs font-medium">Q1</div>
              <div className="h-16 bg-green-200 dark:bg-green-800/30 rounded flex items-center justify-center text-xs font-medium">Q2</div>
              <div className="h-20 bg-green-300 dark:bg-green-700/30 rounded flex items-center justify-center text-xs font-medium">Q3</div>
              <div className="h-24 bg-green-400 dark:bg-green-600/30 rounded flex items-center justify-center text-xs font-medium">Q4</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contract Status</h3>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">87.5%</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Contracts in active status</p>
            <div className="mt-4 flex gap-2">
              <div className="flex-1">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: '87.5%' }}></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Active</div>
              </div>
              <div className="flex-1">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-orange-500 rounded-full" style={{ width: '12.5%' }}></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Renewal Due</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
