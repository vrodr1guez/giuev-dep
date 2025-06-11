'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Check, 
  ArrowRight,
  Zap,
  Car,
  Battery,
  Navigation,
  Cpu,
  Clock,
  Shield,
  Award,
  Users,
  Star,
  PlayCircle,
  FileText,
  Phone,
  Calendar,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Globe,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('new') === 'true';
  
  const [userData, setUserData] = useState(null);
  const [signupData, setSignupData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    const storedSignup = localStorage.getItem('signupData');
    
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    
    if (storedSignup) {
      setSignupData(JSON.parse(storedSignup));
    }
  }, []);

  if (!userData || !signupData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Industry configurations
  const customerTypes = {
    utilities: {
      label: 'Electric Utilities',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-indigo-600',
      nextSteps: [
        { title: 'Grid Integration Setup', description: 'Connect your SCADA systems', time: '30 min' },
        { title: 'V2G Protocol Configuration', description: 'Setup bidirectional energy flow', time: '45 min' },
        { title: 'Revenue Stream Analysis', description: 'Identify profit opportunities', time: '60 min' }
      ]
    },
    fleets: {
      label: 'Fleet Operators',
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradientFrom: 'from-green-600',
      gradientTo: 'to-emerald-600',
      nextSteps: [
        { title: 'Fleet Data Import', description: 'Connect your existing systems', time: '15 min' },
        { title: 'Vehicle Setup', description: 'Add your EV fleet details', time: '30 min' },
        { title: 'Route Optimization', description: 'Configure your first optimized routes', time: '45 min' }
      ]
    },
    batteries: {
      label: 'Battery Manufacturers',
      icon: Battery,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradientFrom: 'from-purple-600',
      gradientTo: 'to-pink-600',
      nextSteps: [
        { title: 'Battery Chemistry Profile', description: 'Upload your battery specifications', time: '20 min' },
        { title: 'Digital Twin Setup', description: 'Create your first battery model', time: '40 min' },
        { title: 'Testing Integration', description: 'Connect lab testing systems', time: '60 min' }
      ]
    },
    infrastructure: {
      label: 'Infrastructure Providers',
      icon: Navigation,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradientFrom: 'from-orange-600',
      gradientTo: 'to-red-600',
      nextSteps: [
        { title: 'Station Network Import', description: 'Add your charging stations', time: '25 min' },
        { title: 'Demand Forecasting Setup', description: 'Configure location analysis', time: '35 min' },
        { title: 'Revenue Optimization', description: 'Setup dynamic pricing', time: '50 min' }
      ]
    }
  };

  const planConfigs = {
    'grid-intelligence': {
      name: 'Grid Intelligence',
      industry: 'utilities',
      features: ['V2G Protocol Management', 'Peak Demand Forecasting', 'Grid Stability Monitoring', 'Revenue Optimization']
    },
    'fleet-intelligence': {
      name: 'Fleet Intelligence',
      industry: 'fleets',
      features: ['Real-time Fleet Monitoring', 'Predictive Maintenance', 'AI Route Optimization', 'Energy Cost Analytics']
    },
    'battery-intelligence': {
      name: 'Battery Intelligence',
      industry: 'batteries',
      features: ['Digital Twin Battery Modeling', 'Chemistry Optimization', 'Degradation Prediction', 'Warranty Cost Reduction']
    },
    'infrastructure-intelligence': {
      name: 'Infrastructure Intelligence',
      industry: 'infrastructure',
      features: ['Station Placement AI', 'Dynamic Pricing Optimization', 'Demand Forecasting', 'Revenue Analytics']
    }
  };

  const currentCustomerType = customerTypes[userData.industry];
  const currentPlan = planConfigs[userData.plan];
  const Icon = currentCustomerType.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GIU Intelligence
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {userData.name}</span>
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Welcome Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Welcome to {currentPlan.name}! 
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Your account is ready and your 14-day free trial has started. 
            Let's get you up and running with the most advanced AI platform for {currentCustomerType.label.toLowerCase()}.
          </p>

          <div className={`inline-flex items-center space-x-2 ${currentCustomerType.bgColor} rounded-full px-6 py-3`}>
            <Icon className={`w-5 h-5 ${currentCustomerType.color}`} />
            <span className={`font-bold ${currentCustomerType.color}`}>
              {currentCustomerType.label}
            </span>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
          
          <div className="space-y-6">
            {currentCustomerType.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} rounded-full flex items-center justify-center text-white font-bold`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Estimated time: {step.time}</span>
                  </div>
                </div>
                <button className={`px-4 py-2 bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} text-white rounded-lg font-medium hover:shadow-lg transition-all`}>
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* What You Get */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* Plan Features */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Your {currentPlan.name} Features
            </h3>
            
            <div className="space-y-3">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support & Resources */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-5 h-5 text-blue-500 mr-2" />
              Support & Resources
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">24/7 Priority Support</div>
                  <div className="text-sm text-gray-600">Direct access to our technical team</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Free Implementation Call</div>
                  <div className="text-sm text-gray-600">1-hour consultation with our experts</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Complete Documentation</div>
                  <div className="text-sm text-gray-600">API docs, guides, and best practices</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link 
            href="/dashboard"
            className={`block p-6 bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} text-white rounded-2xl text-center hover:shadow-xl transition-all transform hover:scale-105`}
          >
            <PlayCircle className="w-8 h-8 mx-auto mb-3" />
            <div className="font-bold">Go to Dashboard</div>
            <div className="text-sm opacity-90">Start using your platform</div>
          </Link>
          
          <Link 
            href="/schedule-demo?type=implementation"
            className="block p-6 bg-white border-2 border-gray-200 rounded-2xl text-center hover:shadow-xl hover:border-gray-300 transition-all transform hover:scale-105"
          >
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="font-bold text-gray-900">Schedule Setup Call</div>
            <div className="text-sm text-gray-600">Free 1-hour implementation session</div>
          </Link>
          
          <Link 
            href="/api-docs"
            className="block p-6 bg-white border-2 border-gray-200 rounded-2xl text-center hover:shadow-xl hover:border-gray-300 transition-all transform hover:scale-105"
          >
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="font-bold text-gray-900">View Documentation</div>
            <div className="text-sm text-gray-600">API docs and integration guides</div>
          </Link>
        </div>

        {/* Trial Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-2">Your 14-Day Free Trial Has Started</h3>
          <p className="text-blue-800 mb-4">
            You have full access to all {currentPlan.name} features until {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
            No charges will apply during your trial period.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>No credit card charged</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Full feature access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 