"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, FileText } from 'lucide-react';

const APIDocs = () => {
  const [activeTab, setActiveTab] = useState('swagger');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
            API Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
            Complete reference for integrating with our EV Charging Infrastructure platform
          </p>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('swagger')}
              className={`flex items-center px-6 py-4 font-medium text-sm focus:outline-none ${
                activeTab === 'swagger'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Swagger UI
            </button>
            <button 
              onClick={() => setActiveTab('guides')}
              className={`flex items-center px-6 py-4 font-medium text-sm focus:outline-none ${
                activeTab === 'guides'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Integration Guides
            </button>
            <button 
              onClick={() => setActiveTab('auth')}
              className={`flex items-center px-6 py-4 font-medium text-sm focus:outline-none ${
                activeTab === 'auth'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Authentication
            </button>
          </div>

          {activeTab === 'swagger' && (
            <div className="p-2 md:p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    Interactive API Explorer
                  </h2>
                  <a 
                    href="http://localhost:8000/docs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 text-sm flex items-center hover:underline"
                  >
                    Open in new window
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
                <div className="p-0 h-[calc(80vh-160px)]">
                  <iframe 
                    src="http://localhost:8000/docs"
                    className="w-full h-full border-0"
                    title="API Documentation"
                    onError={() => {
                      console.error("Failed to load API documentation");
                    }}
                  />
                </div>
              </div>
              
              {/* Fallback content if iframe fails */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Quick API Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Core Endpoints</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• <code>/health</code> - System health check</li>
                      <li>• <code>/docs</code> - Interactive API documentation</li>
                      <li>• <code>/openapi.json</code> - OpenAPI schema</li>
                      <li>• <code>/metrics</code> - Prometheus metrics</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Business APIs</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• <code>/api/v1/charging-stations</code> - Station management</li>
                      <li>• <code>/api/v1/grid-partnerships</code> - Grid integration</li>
                      <li>• <code>/api/v1/federated-learning-plus</code> - Enhanced ML</li>
                      <li>• <code>/api/v1/charging-schedules</code> - Smart scheduling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guides' && (
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Integration Guides</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    Getting Started
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Learn the basics of integrating with our API platform including authentication, rate limits, and error handling.</p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    View Guide <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    Authentication & Authorization
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Detailed guide on securing your API requests with OAuth 2.0 tokens and managing access scopes.</p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    View Guide <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    Webhooks Setup
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Learn how to receive real-time event notifications using our webhook system.</p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    View Guide <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    Code Examples
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Sample code in multiple languages for common integration scenarios.</p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    View Guide <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Authentication</h2>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">OAuth 2.0 Authentication</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our API uses OAuth 2.0 for authentication. Follow these steps to authenticate your requests:
                </p>
                
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mr-3">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Register your application</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Create a new application in the developer portal to obtain your client credentials.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mr-3">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Request an access token</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Exchange your client credentials for an access token using the token endpoint.
                      </p>
                      <div className="mt-2 bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                        <code className="text-sm text-gray-800 dark:text-gray-300 font-mono">
                          POST /api/v1/auth/token<br />
                          Content-Type: application/x-www-form-urlencoded<br /><br />
                          grant_type=client_credentials&<br />
                          client_id=YOUR_CLIENT_ID&<br />
                          client_secret=YOUR_CLIENT_SECRET
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mr-3">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Use the access token</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Include the access token in the Authorization header of your API requests.
                      </p>
                      <div className="mt-2 bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                        <code className="text-sm text-gray-800 dark:text-gray-300 font-mono">
                          GET /api/v1/vehicles<br />
                          Authorization: Bearer YOUR_ACCESS_TOKEN
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">API Keys (Alternative Method)</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  For simple integrations, you can also use API keys for authentication:
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mr-3">
                      <FileText className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">API Key Authentication</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Include your API key in the request header for each request:
                      </p>
                      <div className="mt-2 bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                        <code className="text-sm text-gray-800 dark:text-gray-300 font-mono">
                          GET /api/v1/charging-stations<br />
                          X-API-Key: YOUR_API_KEY
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-white/80 mr-3" />
            <h2 className="text-xl font-bold">Need help with integration?</h2>
          </div>
          <p className="text-blue-100 mb-4">
            Our developer support team is available to help you integrate with our platform. Contact us for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-2 px-4 rounded-lg flex items-center justify-center">
              Contact Support
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center">
              Join Developer Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocs; 