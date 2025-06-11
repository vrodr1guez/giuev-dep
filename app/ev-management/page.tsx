import React from 'react';
import { 
  FileText, Zap, DollarSign, BarChart, Car, MapPin,
  ArrowRight, Bell, Calendar, Clock, Battery, Settings
} from 'lucide-react';
import Link from 'next/link';

export default function EVManagementPage() {
  const features = [
    {
      id: 'contract-management',
      title: 'Contract Management',
      description: 'Manage all your charging infrastructure contracts in one place with renewal alerts and compliance tracking.',
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      href: '/ev-management/contracts',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'charging-station',
      title: 'Charging Station Management',
      description: 'Centralized control system for EV charging infrastructure with real-time monitoring and maintenance alerts.',
      icon: <Zap className="h-10 w-10 text-purple-500" />,
      href: '/ev-management/stations',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'energy-optimization',
      title: 'Energy Optimization',
      description: 'AI-powered charging schedules that reduce costs by utilizing off-peak electricity rates and prioritizing vehicles based on routes.',
      icon: <Clock className="h-10 w-10 text-green-500" />,
      href: '/ev-management/optimization',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'billing-payment',
      title: 'Billing & Payment',
      description: 'Automated billing system with multiple payment options, employee reimbursement tracking, and detailed invoicing.',
      icon: <DollarSign className="h-10 w-10 text-orange-500" />,
      href: '/ev-management/billing',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'performance-analytics',
      title: 'Performance Analytics',
      description: 'Comprehensive reporting on charging efficiency, energy consumption patterns, and cost optimization opportunities.',
      icon: <BarChart className="h-10 w-10 text-indigo-500" />,
      href: '/ev-management/analytics',
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      id: 'fleet-integration',
      title: 'Fleet Integration',
      description: 'Seamless integration with fleet management systems to optimize vehicle rotations based on charge levels and route requirements.',
      icon: <Car className="h-10 w-10 text-teal-500" />,
      href: '/ev-management/fleet-integration',
      color: 'bg-teal-50 border-teal-200'
    },
    {
      id: 'smart-grid',
      title: 'Smart Grid Connection',
      description: 'Vehicle-to-grid (V2G) capabilities allowing your fleet to participate in energy markets and create additional revenue streams.',
      icon: <Battery className="h-10 w-10 text-red-500" />,
      href: '/ev-management/smart-grid',
      color: 'bg-red-50 border-red-200'
    }
  ];

  const benefits = [
    {
      title: "30% Cost Reduction",
      description: "Lower operational costs through optimized charging schedules and maintenance.",
      icon: <DollarSign className="h-8 w-8 text-green-500" />
    },
    {
      title: "24/7 Monitoring",
      description: "Real-time alerts and notifications for charging infrastructure issues.",
      icon: <Bell className="h-8 w-8 text-blue-500" />
    },
    {
      title: "AI-Powered Planning",
      description: "Intelligent scheduling based on vehicle usage patterns and energy prices.",
      icon: <Calendar className="h-8 w-8 text-purple-500" />
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">EV Charging & Management Solution</h1>
        <p className="text-lg text-gray-600 mb-8">
          Simplify EV fleet operations with our comprehensive charging infrastructure management system.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/ev-management/demo" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Request Demo
          </Link>
          <Link 
            href="/contact" 
            className="px-6 py-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-16 bg-gray-50 py-12 rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-white shadow-sm mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Management Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className={`block p-6 border rounded-lg hover:shadow-md transition-shadow ${feature.color}`}
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
              <div className="mt-4 flex justify-center">
                <span className="inline-flex items-center text-blue-600 hover:text-blue-800">
                  <span>Learn More</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white rounded-lg p-8 text-center mb-16">
        <h2 className="text-2xl font-bold mb-4">Ready to transform your EV fleet management?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Our EV Charging & Management Solution helps you reduce operational costs, increase efficiency, and make data-driven decisions.
        </p>
        <Link 
          href="/contact" 
          className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
        >
          Schedule a Consultation
        </Link>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/3">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Connect</h3>
            <p className="text-sm text-gray-600">Integrate your charging stations and fleet management systems</p>
          </div>
          <div className="hidden md:block w-1/6">
            <ArrowRight className="h-6 w-24 text-gray-300" />
          </div>
          <div className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/3">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Optimize</h3>
            <p className="text-sm text-gray-600">Our AI analyzes your data and creates custom charging schedules</p>
          </div>
          <div className="hidden md:block w-1/6">
            <ArrowRight className="h-6 w-24 text-gray-300" />
          </div>
          <div className="flex flex-col items-center text-center md:w-1/3">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Save</h3>
            <p className="text-sm text-gray-600">Reduce costs and improve efficiency across your entire operation</p>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>&copy; 2024 GIU AI EV Fleet Management. All rights reserved.</p>
        <p className="mt-1">Advanced EV charging infrastructure management powered by AI.</p>
      </footer>
    </div>
  );
} 