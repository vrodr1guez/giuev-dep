"use client";

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X,
  ArrowRight,
  BrainCircuit as Brain,
  Zap as Rocket,
  Shield,
  Award,
  TrendingUp,
  Users,
  Battery,
  Navigation as Network,
  Activity,
  DollarSign,
  Sparkles,
  Info,
  ChevronDown,
  Zap,
  FileText,
  Settings as Terminal,
  BarChart,
  Car,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Gauge,
  Home as Building,
  Search as Eye,
  Database,
  Layers,
  Star,
  ArrowUpRight,
  Clock,
  MapPin,
  Phone,
  PlayCircle,
  Cpu,
  Radio,
  Globe,
  Target,
  TrendingDown,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [customerType, setCustomerType] = useState('fleets');
  const [billingCycle, setBillingCycle] = useState('annual');
  const [selectedPlan, setSelectedPlan] = useState('fleet-intelligence');
  const [fleetSize, setFleetSize] = useState(100);
  const [openFaq, setOpenFaq] = useState(null);
  const [showROICalculator, setShowROICalculator] = useState(false);

  // Industry-Specific Customer Segmentation (Best Practice)
  const customerTypes = {
    utilities: {
      label: 'Electric Utilities',
      description: 'Grid operators & energy companies',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      primaryFocus: 'Grid Integration & V2G Revenue',
      keyMetrics: ['Grid stability', 'Peak shaving', 'Revenue generation'],
      painPoints: ['Grid overload', 'Peak demand costs', 'Renewable integration'],
      valueProps: [
        '40% reduction in peak demand costs',
        '$2.3M annual V2G revenue potential', 
        '99.9% grid stability during peak events'
      ]
    },
    fleets: {
      label: 'Fleet Operators',
      description: 'Commercial & logistics fleets',
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      primaryFocus: 'Operational Efficiency & Cost Reduction',
      keyMetrics: ['Operating costs', 'Vehicle uptime', 'Route efficiency'],
      painPoints: ['High energy costs', 'Vehicle downtime', 'Route inefficiency'],
      valueProps: [
        '28% reduction in operational costs',
        '94% vehicle uptime guarantee',
        '35% improvement in route efficiency'
      ]
    },
    batteries: {
      label: 'Battery Manufacturers',
      description: 'Battery OEMs & technology companies',
      icon: Battery,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      primaryFocus: 'Performance Optimization & Lifecycle Management',
      keyMetrics: ['Battery lifespan', 'Performance optimization', 'Warranty costs'],
      painPoints: ['Premature degradation', 'Warranty claims', 'Performance unpredictability'],
      valueProps: [
        '25% extended battery lifespan',
        '60% reduction in warranty claims',
        '91% accuracy in failure prediction'
      ]
    },
    infrastructure: {
      label: 'Infrastructure Providers',
      description: 'Charging network operators & developers',
      icon: Network,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      primaryFocus: 'Network Optimization & Asset Utilization',
      keyMetrics: ['Utilization rates', 'Revenue per station', 'Network efficiency'],
      painPoints: ['Low utilization', 'Demand forecasting', 'Maintenance costs'],
      valueProps: [
        '45% increase in station utilization',
        '$180K additional revenue per station/year',
        '50% reduction in maintenance costs'
      ]
    }
  };

  // Industry-Specific Pricing Plans
  const pricingPlans = [
    {
      id: 'grid-intelligence',
      name: 'Grid Intelligence',
      badge: 'UTILITIES & ENERGY',
      description: 'Grid integration, V2G optimization, and peak management',
      targetCustomer: ['utilities'],
      primaryUseCase: 'Smart grid management and V2G revenue generation',
      valueProps: ['Grid stability optimization', 'V2G revenue streams', 'Peak demand reduction'],
      pricing: {
        utilities: { monthly: 15000, annual: 12000, setup: 25000 }
      },
      industryMetrics: {
        roiPeriod: '4-6 months',
        avgSavings: '$2.3M annually',
        efficiency: '40% peak reduction'
      },
      addOnServices: [
        { name: 'Grid Integration Setup', price: 50000, description: 'Complete utility grid integration with V2G protocols' },
        { name: 'Regulatory Compliance Package', price: 25000, description: 'NERC CIP, FERC compliance and reporting' },
        { name: 'Peak Management Optimization', price: 35000, description: 'Advanced demand response and load balancing' }
      ],
      features: [
        { 
          category: 'Grid Integration',
          items: [
            { text: 'V2G Protocol Management', detail: 'Bidirectional energy flow optimization', included: true, exclusive: true },
            { text: 'Peak Demand Forecasting', detail: 'ML-powered grid load prediction', included: true, exclusive: true },
            { text: 'Grid Stability Monitoring', detail: 'Real-time frequency regulation', included: true },
            { text: 'Renewable Integration', detail: 'Solar/wind coordination', included: true }
          ]
        },
        { 
          category: 'Revenue Generation',
          items: [
            { text: 'V2G Revenue Optimization', detail: 'Maximize energy arbitrage', included: true, exclusive: true },
            { text: 'Ancillary Services', detail: 'Frequency regulation revenue', included: true },
            { text: 'Demand Response Programs', detail: 'Utility incentive optimization', included: true },
            { text: 'Carbon Credit Tracking', detail: 'Environmental credit monetization', included: true }
          ]
        },
        { 
          category: 'Compliance & Reporting',
          items: [
            { text: 'NERC CIP Compliance', detail: 'Critical infrastructure protection', included: true },
            { text: 'Real-time Grid Reporting', detail: 'Regulatory compliance dashboards', included: true },
            { text: 'Environmental Impact Tracking', detail: 'Sustainability reporting', included: true },
            { text: 'Audit Trail Management', detail: 'Complete transaction history', included: true }
          ]
        }
      ],
      cta: 'Request Grid Demo',
      ctaUrl: '/schedule-demo?industry=utilities',
      popular: false
    },
    {
      id: 'fleet-intelligence',
      name: 'Fleet Intelligence',
      badge: 'FLEET OPERATORS',
      description: 'Operational efficiency, route optimization, and cost management',
      targetCustomer: ['fleets'],
      primaryUseCase: 'Fleet operational optimization and cost reduction',
      valueProps: ['28% cost reduction', '94% uptime guarantee', 'Route optimization'],
      pricing: {
        fleets: { monthly: 8500, annual: 6800, setup: 15000 }
      },
      industryMetrics: {
        roiPeriod: '2-3 months',
        avgSavings: '$420K annually',
        efficiency: '28% cost reduction'
      },
      addOnServices: [
        { name: 'Fleet Migration & Integration', price: 30000, description: 'Complete fleet system integration and migration' },
        { name: 'Driver Training Program', price: 15000, description: 'EV optimization training for drivers' },
        { name: 'Route Optimization Plus', price: 20000, description: 'Advanced multi-modal route planning' }
      ],
      features: [
        { 
          category: 'Fleet Operations',
          items: [
            { text: 'Real-time Fleet Monitoring', detail: 'Live vehicle tracking and status', included: true },
            { text: 'Predictive Maintenance', detail: '91% accuracy failure prediction', included: true, exclusive: true },
            { text: 'Energy Cost Optimization', detail: 'Smart charging cost reduction', included: true, exclusive: true },
            { text: 'Vehicle Uptime Guarantee', detail: '94% guaranteed availability', included: true }
          ]
        },
        { 
          category: 'Route & Logistics',
          items: [
            { text: 'AI Route Optimization', detail: '35% efficiency improvement', included: true, exclusive: true },
            { text: 'Charging Station Planning', detail: 'Optimal charging network design', included: true },
            { text: 'Load Distribution', detail: 'Smart cargo and vehicle assignment', included: true },
            { text: 'Delivery Time Optimization', detail: 'Customer satisfaction improvement', included: true }
          ]
        },
        { 
          category: 'Cost Management',
          items: [
            { text: 'Energy Cost Analytics', detail: 'Real-time cost tracking', included: true },
            { text: 'Maintenance Cost Reduction', detail: 'Predictive maintenance savings', included: true },
            { text: 'Insurance Optimization', detail: 'Risk-based premium reduction', included: true },
            { text: 'Carbon Footprint Tracking', detail: 'Sustainability reporting', included: true }
          ]
        }
      ],
      cta: 'Start Fleet Trial',
      ctaUrl: '/auth/signup?plan=fleet',
      popular: true
    },
    {
      id: 'battery-intelligence',
      name: 'Battery Intelligence',
      badge: 'BATTERY MANUFACTURERS',
      description: 'Battery optimization, lifecycle management, and warranty reduction',
      targetCustomer: ['batteries'],
      primaryUseCase: 'Battery performance optimization and warranty cost reduction',
      valueProps: ['25% longer lifespan', '60% fewer warranty claims', 'AI-powered optimization'],
      pricing: {
        batteries: { monthly: 12000, annual: 9600, setup: 20000 }
      },
      industryMetrics: {
        roiPeriod: '3-4 months',
        avgSavings: '$1.8M annually',
        efficiency: '25% lifespan extension'
      },
      addOnServices: [
        { name: 'Battery Chemistry Optimization', price: 40000, description: 'Custom chemistry analysis and optimization' },
        { name: 'Warranty Analytics Platform', price: 25000, description: 'Advanced warranty claim prediction and management' },
        { name: 'Battery Testing Integration', price: 30000, description: 'Lab testing and validation integration' }
      ],
      features: [
        { 
          category: 'Battery Optimization',
          items: [
            { text: 'Digital Twin Battery Modeling', detail: 'Physics-based performance prediction', included: true, exclusive: true },
            { text: 'Chemistry Optimization', detail: 'AI-powered material enhancement', included: true, exclusive: true },
            { text: 'Thermal Management', detail: 'Optimal temperature control', included: true },
            { text: 'Charging Protocol Optimization', detail: 'Extended lifespan charging', included: true }
          ]
        },
        { 
          category: 'Lifecycle Management',
          items: [
            { text: 'Degradation Prediction', detail: '91% accuracy in failure forecasting', included: true, exclusive: true },
            { text: 'State of Health Monitoring', detail: 'Real-time battery condition', included: true },
            { text: 'End-of-Life Prediction', detail: 'Accurate replacement planning', included: true },
            { text: 'Recycling Optimization', detail: 'Second-life application planning', included: true }
          ]
        },
        { 
          category: 'Quality & Warranty',
          items: [
            { text: 'Warranty Cost Reduction', detail: '60% reduction in claims', included: true, exclusive: true },
            { text: 'Quality Assurance AI', detail: 'Manufacturing defect prediction', included: true },
            { text: 'Performance Benchmarking', detail: 'Competitive analysis tools', included: true },
            { text: 'Customer Support Analytics', detail: 'Proactive customer service', included: true }
          ]
        }
      ],
      cta: 'Demo Battery AI',
      ctaUrl: '/schedule-demo?industry=batteries',
      popular: false
    },
    {
      id: 'infrastructure-intelligence',
      name: 'Infrastructure Intelligence',
      badge: 'CHARGING NETWORKS',
      description: 'Charging network optimization, demand forecasting, and revenue maximization',
      targetCustomer: ['infrastructure'],
      primaryUseCase: 'Charging network optimization and revenue maximization',
      valueProps: ['45% higher utilization', '$180K revenue/station', 'Demand forecasting'],
      pricing: {
        infrastructure: { monthly: 10000, annual: 8000, setup: 18000 }
      },
      industryMetrics: {
        roiPeriod: '3-5 months',
        avgSavings: '$1.2M annually',
        efficiency: '45% utilization increase'
      },
      addOnServices: [
        { name: 'Network Planning & Design', price: 35000, description: 'Optimal charging station placement and sizing' },
        { name: 'Demand Forecasting Plus', price: 20000, description: 'Advanced ML demand prediction models' },
        { name: 'Revenue Optimization Suite', price: 25000, description: 'Dynamic pricing and revenue management' }
      ],
      features: [
        { 
          category: 'Network Optimization',
          items: [
            { text: 'Station Placement AI', detail: 'Optimal location analysis', included: true, exclusive: true },
            { text: 'Capacity Planning', detail: 'Future demand forecasting', included: true, exclusive: true },
            { text: 'Load Balancing', detail: 'Grid impact minimization', included: true },
            { text: 'Network Expansion Planning', detail: 'Growth strategy optimization', included: true }
          ]
        },
        { 
          category: 'Revenue Management',
          items: [
            { text: 'Dynamic Pricing Optimization', detail: 'Real-time price adjustment', included: true, exclusive: true },
            { text: 'Utilization Maximization', detail: '45% increase in station usage', included: true },
            { text: 'Customer Acquisition AI', detail: 'Targeted marketing optimization', included: true },
            { text: 'Revenue Analytics', detail: 'Per-station profitability tracking', included: true }
          ]
        },
        { 
          category: 'Operations & Maintenance',
          items: [
            { text: 'Predictive Maintenance', detail: '50% reduction in maintenance costs', included: true, exclusive: true },
            { text: 'Station Health Monitoring', detail: 'Real-time equipment status', included: true },
            { text: 'Customer Experience Optimization', detail: 'Reduced wait times and issues', included: true },
            { text: 'Energy Cost Management', detail: 'Optimal energy procurement', included: true }
          ]
        }
      ],
      cta: 'Optimize Network',
      ctaUrl: '/auth/signup?plan=infrastructure',
      popular: false
    }
  ];

  // Industry-Specific Pricing Multipliers
  const industryPricing = {
    logistics: {
      multiplier: 1.0,
      label: 'Logistics & Transportation',
      specializations: ['Route optimization', 'Delivery scheduling', 'Last-mile efficiency'],
      compliance: ['DOT regulations', 'Hours of service tracking']
    },
    utilities: {
      multiplier: 1.3,
      label: 'Utilities & Energy',
      specializations: ['Grid integration', 'Peak load management', 'Renewable coordination'],
      compliance: ['NERC CIP', 'ISO standards', 'Utility regulations']
    },
    manufacturing: {
      multiplier: 1.2,
      label: 'Manufacturing & Industrial',
      specializations: ['Production scheduling', 'Supply chain optimization', 'Equipment coordination'],
      compliance: ['ISO 50001', 'Energy management standards']
    },
    government: {
      multiplier: 0.85,
      label: 'Government & Public Sector',
      specializations: ['Taxpayer transparency', 'Public reporting', 'Multi-agency coordination'],
      compliance: ['FedRAMP', 'FIPS 140-2', 'Government security standards']
    }
  };

  // Advanced Platform Capabilities (Add-ons)
  const advancedCapabilities = [
    {
      id: 'v2g-management-center',
      name: 'V2G Management Center',
      price: { startup: 25000, growing: 35000, enterprise: 'Custom' },
      description: 'Complete Vehicle-to-Grid revenue optimization platform',
      benefits: ['$521K monthly revenue potential', 'Grid partnership management', 'Automated dispatch scheduling'],
      technical: 'Real-time feasibility analysis, grid utility partnerships, fleet program integration',
      popular: true,
      badge: 'REVENUE GENERATOR'
    },
    {
      id: 'edge-computing',
      name: 'Edge Computing Platform',
      price: { startup: 15000, growing: 25000, enterprise: 'Custom' },
      description: 'Local processing nodes for real-time decision making',
      benefits: ['Sub-10ms response times', 'Offline operation capability', 'Reduced bandwidth costs'],
      technical: 'Kubernetes-based edge deployment with automatic failover'
    },
    {
      id: 'quantum-computing',
      name: 'Quantum Computing Access',
      price: { startup: 'N/A', growing: 50000, enterprise: 'Custom' },
      description: 'Early access to quantum optimization algorithms',
      benefits: ['10x faster route optimization', 'Advanced battery chemistry modeling', 'Quantum-enhanced ML'],
      technical: 'Partnership with IBM Quantum & Google Quantum AI'
    },
    {
      id: 'blockchain-platform',
      name: 'Blockchain & Smart Contracts',
      price: { startup: 8000, growing: 15000, enterprise: 'Custom' },
      description: 'Transparent, auditable fleet operations',
      benefits: ['Immutable audit trails', 'Automated compliance', 'Multi-party trust'],
      technical: 'Ethereum-compatible with Layer 2 scaling'
    },
    {
      id: 'advanced-security',
      name: 'Advanced Security Suite',
      price: { startup: 5000, growing: 12000, enterprise: 'Custom' },
      description: 'Military-grade security & compliance',
      benefits: ['Zero-trust architecture', 'Advanced threat detection', 'Compliance automation'],
      technical: 'SOC 2 Type II, FedRAMP ready, GDPR compliant'
    }
  ];

  // Business Model Extensions
  const businessPrograms = [
    {
      id: 'partner-program',
      name: 'Partner & Reseller Program',
      commission: '20-40%',
      description: 'Sell GIU Intelligence with full technical support',
      benefits: ['Technical training', 'Sales enablement', 'Co-marketing support'],
      requirements: 'Minimum $1M annual commitment'
    },
    {
      id: 'white-label',
      name: 'White-Label Licensing',
      pricing: 'Revenue share',
      description: 'Your brand, our technology platform',
      benefits: ['Full customization', 'Your customer relationships', 'Ongoing development'],
      requirements: 'Enterprise customers only'
    },
    {
      id: 'revenue-share',
      name: 'Revenue Sharing Models',
      pricing: '5-15% of savings',
      description: 'Pay based on measurable fleet improvements',
      benefits: ['Performance-based pricing', 'Guaranteed ROI', 'Shared success'],
      requirements: 'Minimum 100 vehicles, 12-month commitment'
    }
  ];

  // Calculate ROI based on industry type and specific metrics
  const calculateROI = (industryType: string, planId: string) => {
    const industryROI = {
      'utilities': {
        'grid-intelligence': { 
          annualSavings: 2300000, 
          annualCost: 144000, 
          efficiency: '40% peak reduction',
          customMetric: 'Grid Stability Events: 99.9%'
        }
      },
      'fleets': {
        'fleet-intelligence': { 
          annualSavings: 420000, 
          annualCost: 81600,
          efficiency: '28% cost reduction', 
          customMetric: 'Vehicle Uptime: 94%'
        }
      },
      'batteries': {
        'battery-intelligence': { 
          annualSavings: 1800000, 
          annualCost: 115200,
          efficiency: '25% lifespan extension',
          customMetric: 'Warranty Claims: -60%'
        }
      },
      'infrastructure': {
        'infrastructure-intelligence': { 
          annualSavings: 1200000, 
          annualCost: 96000,
          efficiency: '45% utilization increase',
          customMetric: 'Revenue/Station: +$180K'
        }
      }
    };

    const roi = industryROI[industryType]?.[planId] || industryROI['fleets']['fleet-intelligence'];
    const netROI = roi.annualSavings - roi.annualCost;
    const roiMultiple = roi.annualCost > 0 ? (netROI / roi.annualCost) : 0;
    const paybackMonths = roi.annualCost > 0 ? Math.max(1, Math.round(roi.annualCost / (roi.annualSavings / 12))) : 0;

    return {
      annualSavings: roi.annualSavings,
      annualCost: roi.annualCost,
      netROI,
      roiMultiple: Math.max(roiMultiple, 0),
      paybackMonths,
      efficiency: roi.efficiency,
      customMetric: roi.customMetric
    };
  };

  // Enhanced FAQs organized by industry type
  const faqsByType = {
    utilities: [
      {
        question: "How does V2G revenue generation work with our grid?",
        answer: "Our platform integrates with your existing grid management systems to optimize bidirectional energy flow. Typical utilities see $2.3M annual revenue from V2G arbitrage, demand response programs, and frequency regulation services."
      },
      {
        question: "What regulatory compliance is included?",
        answer: "We provide NERC CIP, FERC compliance, and real-time reporting for all grid operations. Our platform maintains complete audit trails and automated compliance reporting to reduce your regulatory burden by 60%."
      },
      {
        question: "How quickly can we integrate with our existing SCADA systems?",
        answer: "Grid integration typically takes 4-6 weeks with our dedicated utility team. We support all major SCADA protocols and provide seamless integration with existing dispatch systems."
      }
    ],
    fleets: [
      {
        question: "What's the typical ROI timeline for fleet operations?",
        answer: "Most fleet operators see positive ROI within 2-3 months. With our 28% operational cost reduction and 94% uptime guarantee, a 100-vehicle fleet typically saves $420,000 annually."
      },
      {
        question: "How does route optimization integrate with our existing logistics?",
        answer: "Our AI seamlessly integrates with major fleet management systems (Geotab, Verizon Connect, etc.). You'll see 35% route efficiency improvements while maintaining your existing operational workflows."
      },
      {
        question: "What about driver training and adoption?",
        answer: "We provide comprehensive driver training programs and real-time coaching through our mobile app. Most fleets see 95%+ driver adoption within 30 days."
      }
    ],
    batteries: [
      {
        question: "How accurate is your battery degradation prediction?",
        answer: "Our Digital Twin technology achieves 91% accuracy in predicting battery failures and degradation patterns. This leads to 25% extended battery lifespan and 60% reduction in warranty claims."
      },
      {
        question: "Can you integrate with our existing testing and validation processes?",
        answer: "Yes, we integrate with all major battery testing equipment and provide APIs for seamless data flow. Our platform enhances your existing QA processes with AI-powered defect prediction."
      },
      {
        question: "What chemistry optimization capabilities do you offer?",
        answer: "Our AI analyzes battery chemistry performance and suggests optimizations for your specific use cases. We've helped manufacturers improve energy density by 15-20% while extending lifespan."
      }
    ],
    infrastructure: [
      {
        question: "How does dynamic pricing optimization work?",
        answer: "Our AI analyzes real-time demand, grid conditions, and competitor pricing to optimize your rates automatically. This typically increases station utilization by 45% and revenue by $180K per station annually."
      },
      {
        question: "What's included in demand forecasting?",
        answer: "We provide hyperlocal demand forecasting using weather, traffic, events, and EV adoption data. Our ML models help you optimize station placement and capacity planning for maximum ROI."
      },
      {
        question: "How do you help reduce maintenance costs?",
        answer: "Our predictive maintenance AI monitors all station components in real-time, predicting failures before they occur. This reduces maintenance costs by 50% and increases station availability to 98%+."
      }
    ]
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navigation */}
      <nav className="nav-premium fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-electric rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-display-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GIU Intelligence
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-item">Home</Link>
              <Link href="/ai-insights" className="nav-item">Technology</Link>
              <Link href="/schedule-demo" className="nav-item">Demo</Link>
              <div className="flex items-center space-x-3">
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">Login</Link>
                <Link href="/auth/signup" className="btn-primary">Get Started</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Revolutionary Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-indigo-100/30 to-purple-100/30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full px-6 py-3 mb-8 shadow-lg">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Value-Based Pricing Model</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Pricing That Reflects
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Revolutionary Value
              </span>
            </h1>
            
            <p className="text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              <span className="text-blue-600 font-bold">Industry-first technologies.</span>
              <span className="text-green-600 font-bold"> Proven ROI.</span>
              <span className="text-purple-600 font-bold"> Transparent pricing.</span><br/>
              Choose the intelligence level that transforms your fleet.
            </p>

            {/* Industry-Specific Customer Selector */}
            <div className="max-w-6xl mx-auto mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Which industry describes your business?</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(customerTypes).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setCustomerType(type)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                        customerType === type
                          ? `border-blue-500 ${config.bgColor} shadow-lg scale-105 ring-2 ring-blue-200`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mb-4 ${customerType === type ? config.color : 'text-gray-400'}`} />
                      <h4 className={`font-bold text-lg mb-2 ${customerType === type ? 'text-gray-900' : 'text-gray-700'}`}>
                        {config.label}
                      </h4>
                      <p className={`text-sm mb-3 ${customerType === type ? 'text-gray-700' : 'text-gray-600'}`}>
                        {config.description}
                      </p>
                      
                      {/* Primary Focus */}
                      <div className="mb-3">
                        <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                          customerType === type ? config.color : 'text-gray-500'
                        }`}>
                          Primary Focus
                </div>
                        <p className={`text-sm font-medium ${customerType === type ? 'text-gray-800' : 'text-gray-600'}`}>
                          {config.primaryFocus}
                </p>
              </div>

                      {/* Key Value Props Preview */}
                      {customerType === type && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">
                            Proven Results
                          </div>
                          <div className="space-y-1">
                            {config.valueProps.slice(0, 2).map((prop, idx) => (
                              <div key={idx} className="flex items-center text-xs text-gray-700">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                                <span>{prop}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Industry-Specific Value Proposition */}
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 text-blue-600 mr-2" />
                      Key Challenges
                    </h4>
                    <ul className="space-y-2">
                      {customerTypes[customerType].painPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <BarChart className="w-5 h-5 text-green-600 mr-2" />
                      Key Metrics
                    </h4>
                    <ul className="space-y-2">
                      {customerTypes[customerType].keyMetrics.map((metric, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                      <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                      Our Solutions
                    </h4>
                    <ul className="space-y-2">
                      {customerTypes[customerType].valueProps.map((prop, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                          {prop}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry-Specific Pricing Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Solutions Built for {customerTypes[customerType].label}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {customerTypes[customerType].primaryFocus} - powered by industry-first AI technologies
            </p>
            </div>
            
            {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-lg font-medium transition-colors ${
                billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
              }`}>
                Monthly
              </span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-8 w-16 items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  billingCycle === 'annual' ? 'translate-x-9' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-lg font-medium transition-colors ${
                billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'
              }`}>
                Annual
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                Save 20%
                </span>
              </span>
            </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => {
              // Only show plans relevant to selected customer type
              if (!plan.targetCustomer.includes(customerType)) return null;
              
              const pricing = plan.pricing[customerType];
              const roi = calculateROI(customerType, plan.id);
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl shadow-xl transition-all duration-300 hover:scale-105 ${
                    plan.popular ? 'ring-4 ring-blue-500 ring-offset-4 lg:scale-110' : ''
                  }`}
                  onMouseEnter={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                        ⭐ MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full px-4 py-2 mb-4 text-sm font-bold">
                      <Award className="w-4 h-4" />
                      <span>{plan.badge}</span>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>

                    {/* Value Props */}
                    <div className="space-y-2 mb-6">
                      {plan.valueProps.map((prop, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-800">{prop}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dynamic Pricing Display */}
                    {typeof pricing?.monthly === 'number' ? (
                      <div className="mb-8">
                        <p className="text-sm text-gray-600 mb-2">Starting at:</p>
                        <div className="flex items-baseline mb-2">
                          <span className="text-5xl font-black text-gray-900">
                            ${(billingCycle === 'monthly' ? pricing.monthly : pricing.annual).toLocaleString()}
                          </span>
                          <span className="ml-2 text-gray-600">/month</span>
                        </div>
                        {billingCycle === 'annual' && (
                          <p className="text-sm text-green-600 font-medium">
                            Save ${((pricing.monthly - pricing.annual) * 12).toLocaleString()}/year
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          + ${pricing.setup.toLocaleString()} one-time setup
                        </p>
                      </div>
                    ) : (
                      <div className="mb-8">
                        <div className="flex items-baseline mb-2">
                          <span className="text-5xl font-black text-gray-900">Custom</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Tailored pricing based on your requirements
                        </p>
                      </div>
                    )}

                    {/* ROI Preview */}
                    {typeof pricing?.monthly === 'number' && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
                        <h4 className="font-bold text-gray-900 mb-2">ROI Preview</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Annual Savings</p>
                            <p className="font-bold text-green-600">${roi.annualSavings.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Payback Period</p>
                            <p className="font-bold text-blue-600">{roi.paybackMonths} months</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Features with Add-On Services */}
                    <div className="space-y-6 mb-8">
                      {plan.features.map((category, catIdx) => (
                        <div key={catIdx}>
                          <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                            {category.category}
                          </h4>
                          <div className="space-y-2">
                            {category.items.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          {feature.included ? (
                            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              feature.exclusive ? 'text-blue-600' : 'text-green-600'
                            }`} />
                          ) : (
                            <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400" />
                          )}
                          <div className="flex-1">
                                  <span className={`text-sm font-medium ${
                              feature.included ? 'text-gray-700' : 'text-gray-400'
                                  }`}>
                              {feature.text}
                              {feature.exclusive && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                                  EXCLUSIVE
                                </span>
                              )}
                            </span>
                            {feature.detail && feature.included && (
                              <p className="text-xs text-gray-500 mt-0.5">{feature.detail}</p>
                            )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
      
                    {/* Add-On Services */}
                    {plan.addOnServices && plan.addOnServices.length > 0 && (
                      <div className="mb-8">
                        <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                          Professional Services & Add-Ons
                        </h4>
                        <div className="space-y-3">
                          {plan.addOnServices.map((service, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{service.name}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                </div>
                                <div className="text-right ml-3">
                                  <span className="font-bold text-blue-600">
                                    {typeof service.price === 'number' ? `$${service.price.toLocaleString()}` : service.price}
                                  </span>
                                  <p className="text-xs text-gray-500">one-time</p>
                                </div>
                              </div>
                        </div>
                      ))}
                    </div>
                      </div>
                    )}

                    <Link
                      href={`/auth/signup?plan=${plan.id}&industry=${customerType}`}
                      className={`w-full px-8 py-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r ${customerType === 'utilities' ? 'from-blue-600 to-indigo-600' : customerType === 'fleets' ? 'from-green-600 to-emerald-600' : customerType === 'batteries' ? 'from-purple-600 to-pink-600' : 'from-orange-600 to-red-600'} hover:shadow-lg transform hover:scale-105 text-center block`}
                    >
                      Start Free Trial
                      <ArrowRight className="inline-block w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry-Specific Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full px-6 py-3 mb-6">
              <Target className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Industry-Specific Solutions</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Tailored for Your Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized features, compliance, and pricing for different industry requirements
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {Object.entries(industryPricing).map(([key, industry]) => (
              <div key={key} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                    key === 'logistics' ? 'bg-blue-100' :
                    key === 'utilities' ? 'bg-green-100' :
                    key === 'manufacturing' ? 'bg-orange-100' : 'bg-purple-100'
                  }`}>
                    {key === 'logistics' && <Car className="w-8 h-8 text-blue-600" />}
                    {key === 'utilities' && <Zap className="w-8 h-8 text-green-600" />}
                    {key === 'manufacturing' && <Building className="w-8 h-8 text-orange-600" />}
                    {key === 'government' && <Shield className="w-8 h-8 text-purple-600" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{industry.label}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-gray-600">Pricing adjustment:</span>
                    <span className={`font-bold ${
                      industry.multiplier > 1 ? 'text-orange-600' : 
                      industry.multiplier < 1 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {industry.multiplier > 1 ? '+' : industry.multiplier < 1 ? '-' : ''}
                      {Math.abs((industry.multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Specializations</h4>
                    <ul className="space-y-1">
                      {industry.specializations.map((spec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Compliance</h4>
                    <ul className="space-y-1">
                      {industry.compliance.map((comp, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <Shield className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                          {comp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4">Need Custom Industry Solutions?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We also serve mining, agriculture, construction, and other specialized industries with custom compliance and feature sets.
              </p>
              <Link href="/contact?type=industry" className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                Discuss Your Industry
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Platform Capabilities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-3 mb-6">
              <Cpu className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Advanced Platform Capabilities</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Next-Generation Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge capabilities that put you years ahead of the competition
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {advancedCapabilities.map((capability, index) => (
              <div key={capability.id} className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {capability.id === 'edge-computing' && <Network className="w-8 h-8 text-white" />}
                    {capability.id === 'quantum-computing' && <Cpu className="w-8 h-8 text-white" />}
                    {capability.id === 'blockchain-platform' && <Layers className="w-8 h-8 text-white" />}
                    {capability.id === 'advanced-security' && <Shield className="w-8 h-8 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{capability.name}</h3>
                    <p className="text-gray-600">{capability.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(capability.price).map(([tier, price]) => (
                    <div key={tier} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{tier}</div>
                      <div className="font-bold text-lg">
                        {typeof price === 'number' ? `$${price.toLocaleString()}` : price}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Benefits</h4>
                    <ul className="space-y-1">
                      {capability.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <Sparkles className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Details</h4>
                    <p className="text-sm text-gray-600">{capability.technical}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model Extensions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full px-6 py-3 mb-6">
              <Users className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Business Model Extensions</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Partnership & Licensing Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple ways to work with GIU Intelligence beyond traditional subscriptions
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {businessPrograms.map((program, index) => (
              <div key={program.id} className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {program.id === 'partner-program' && <Users className="w-10 h-10 text-white" />}
                    {program.id === 'white-label' && <Award className="w-10 h-10 text-white" />}
                    {program.id === 'revenue-share' && <TrendingUp className="w-10 h-10 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h3>
                  <div className="text-lg font-semibold text-green-600 mb-3">
                    {program.commission || program.pricing}
                  </div>
                  <p className="text-gray-600">{program.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Program Benefits</h4>
                    <ul className="space-y-2">
                      {program.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-sm text-gray-600">{program.requirements}</p>
                  </div>

                  <div className="pt-4">
                    <Link 
                      href={`/contact?program=${program.id}`}
                      className="block w-full text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Custom Business Models</h3>
            <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Need a completely custom arrangement? We work with enterprise customers on equity partnerships, 
              joint ventures, and other strategic relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact?type=strategic"
                className="inline-flex items-center bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Strategic Partnerships
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                href="/schedule-demo?type=enterprise"
                className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-indigo-900 transition-colors"
              >
                Schedule Executive Demo
                <Calendar className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Pricing FAQs
            </h2>
            <p className="text-xl text-gray-600">
              Clear answers about our pricing model
            </p>
          </div>
          
          <div className="space-y-4">
            {faqsByType[customerType].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                )}
                      </div>
            ))}
                      </div>
                      </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-full px-6 py-3 mb-8">
            <Rocket className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-wider">Transform Your Fleet Today</span>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to See Your ROI?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join industry leaders who are already saving millions with our 
            revolutionary AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link 
              href={`/auth/signup?plan=${selectedPlan}&industry=${customerType}`}
              className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-10 py-5 rounded-xl text-xl font-bold hover:bg-white/20 transition-all"
            >
              Get Custom Quote
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>No credit card required</span>
                      </div>
                      <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>14-day free trial</span>
                      </div>
                      <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Unique Value Proposition & ROI Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-white mb-4">
              Why GIU Intelligence Delivers 10x Value
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Our unique technologies create ROI that traditional solutions simply cannot match
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Digital Twin Technology</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200">Investment:</span>
                  <span className="font-bold">$9,900/month</span>
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200">Annual Savings:</span>
                  <span className="text-2xl font-bold text-green-400">$420,000</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <p className="text-indigo-100 text-sm">
                <span className="font-bold">91% failure prediction accuracy</span> means preventing catastrophic battery failures 
                that cost $60,000+ per replacement. Only we have this technology.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Federated Learning Network</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200">Data Exposed:</span>
                  <span className="font-bold text-green-400">0%</span>
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200">Accuracy Gain:</span>
                  <span className="text-2xl font-bold text-blue-400">+40%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{width: '94%'}}></div>
                </div>
              </div>
              <p className="text-indigo-100 text-sm">
                <span className="font-bold">Learn from 15-25 fleets simultaneously</span> while maintaining complete data privacy. 
                Mathematically guaranteed with differential privacy.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Explainable AI</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200">Transparency:</span>
                  <span className="font-bold text-purple-400">100%</span>
              </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200">Audit Ready:</span>
                  <span className="text-2xl font-bold text-yellow-400">Always</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <p className="text-indigo-100 text-sm">
                <span className="font-bold">Complete decision transparency</span> for regulatory compliance. 
                Reduces compliance costs by 60% vs. black-box AI solutions.
              </p>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">ROI Calculator</h3>
              <p className="text-indigo-200">See your potential savings with {customerTypes[customerType].label}</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-white font-medium mb-4">Industry-Specific ROI Analysis</h4>
                <div className="bg-white/20 rounded-xl p-4">
                  <h5 className="font-bold text-white mb-3">Key Metrics for {customerTypes[customerType].label}</h5>
                  <div className="space-y-2">
                    {customerTypes[customerType].keyMetrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center text-indigo-200">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                        <span className="text-sm">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-4">Your Projected ROI</h4>
                {(() => {
                  // Get the current plan for this customer type
                  const currentPlan = pricingPlans.find(plan => plan.targetCustomer.includes(customerType));
                  const roi = currentPlan ? calculateROI(customerType, currentPlan.id) : null;
                  
                  if (!roi) return <p className="text-white">Select a plan to see ROI projection</p>;
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-indigo-200">Annual Investment:</span>
                        <span className="font-bold text-white">${roi.annualCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-200">Annual Savings:</span>
                        <span className="font-bold text-green-400">${roi.annualSavings.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/30 pt-3">
                        <div className="flex justify-between">
                          <span className="text-white font-bold">Net ROI:</span>
                          <span className="text-2xl font-bold text-green-400">${roi.netROI.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-indigo-200">Payback Period:</span>
                          <span className="font-bold text-blue-400">{roi.paybackMonths} months</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-indigo-200">Industry Metric:</span>
                          <span className="font-bold text-purple-400">{roi.customMetric}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Competitive Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              How We Compare to "Competitors"
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              They offer basic dashboards. We offer technologies that don't exist anywhere else.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-left font-bold text-gray-900">Technology</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-600">Traditional Providers</th>
                  <th className="px-6 py-4 text-center font-bold text-blue-600">GIU Intelligence</th>
                  <th className="px-6 py-4 text-center font-bold text-green-600">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900">Digital Twin Technology</td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                    <span className="block text-sm text-gray-500 mt-1">Not available</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                    <span className="block text-sm font-medium text-blue-600 mt-1">Physics-based modeling</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-green-600">91% accuracy</span>
                    <span className="block text-sm text-gray-600">vs 65% industry standard</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">Federated Learning</td>
                  <td className="px-6 py-4 text-center">
                    <X className="w-6 h-6 text-red-500 mx-auto" />
                    <span className="block text-sm text-gray-500 mt-1">Single-fleet only</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                    <span className="block text-sm font-medium text-blue-600 mt-1">15-25 fleet network</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-green-600">+40% accuracy</span>
                    <span className="block text-sm text-gray-600">while 0% data exposed</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900">Explainable AI</td>
                  <td className="px-6 py-4 text-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto" />
                    <span className="block text-sm text-gray-500 mt-1">Black box AI</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-6 h-6 text-blue-600 mx-auto" />
                    <span className="block text-sm font-medium text-blue-600 mt-1">100% transparent</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-green-600">Audit ready</span>
                    <span className="block text-sm text-gray-600">SOC 2 compliant</span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">Implementation Time</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-gray-700">6-12 months</span>
                    <span className="block text-sm text-gray-500 mt-1">Complex integration</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-blue-600">2-4 weeks</span>
                    <span className="block text-sm text-blue-600 mt-1">Plug & play</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-green-600">8x faster</span>
                    <span className="block text-sm text-gray-600">to value</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* Customer-specific FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              FAQs for {customerTypes[customerType].label}
            </h2>
            <p className="text-xl text-gray-600">
              Questions specific to your fleet type and industry
            </p>
          </div>
          
          <div className="space-y-4">
            {faqsByType[customerType].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <PlayCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Watch Demo</h4>
              <p className="text-sm text-gray-600 mb-4">See our platform in action</p>
              <Link href="/schedule-demo" className="text-blue-600 font-medium hover:text-blue-700">
                Schedule Demo →
              </Link>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center">
              <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Speak to Sales</h4>
              <p className="text-sm text-gray-600 mb-4">Get personalized pricing</p>
              <Link href="/contact" className="text-green-600 font-medium hover:text-green-700">
                Contact Sales →
              </Link>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">ROI Analysis</h4>
              <p className="text-sm text-gray-600 mb-4">Custom ROI report</p>
              <Link href="/roi-analysis" className="text-purple-600 font-medium hover:text-purple-700">
                Get Analysis →
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-full px-6 py-3 mb-8">
            <Rocket className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-wider">
              {customerType === 'utilities' ? 'Power the Grid' : 
               customerType === 'fleets' ? 'Optimize Your Fleet' : 
               customerType === 'batteries' ? 'Enhance Performance' : 'Maximize Revenue'}
            </span>
          </div>
          
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            {customerType === 'utilities' 
              ? 'Join utilities using AI to optimize grid operations and generate V2G revenue.'
              : customerType === 'fleets'
              ? 'Scale efficiently with AI technologies that reduce costs and improve uptime.'
              : customerType === 'batteries'
              ? 'Extend battery lifespan and reduce warranty costs with our exclusive AI.'
              : 'Maximize charging network revenue with AI-powered optimization.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link 
              href={`/auth/signup?plan=${selectedPlan}&industry=${customerType}`}
              className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-10 py-5 rounded-xl text-xl font-bold hover:bg-white/20 transition-all"
            >
              Get Custom Quote
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Setup included</span>
            </div>
          </div>

          {/* Success metrics specific to customer type */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black text-green-400 mb-2">
                {customerType === 'utilities' ? '240%' : customerType === 'fleets' ? '420%' : customerType === 'batteries' ? '680%' : '680%'}
              </div>
              <p className="text-sm text-gray-300">Average ROI</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black text-blue-400 mb-2">
                {customerType === 'utilities' ? '2-3' : customerType === 'fleets' ? '3-4' : customerType === 'batteries' ? '4-6' : '4-6'}
              </div>
              <p className="text-sm text-gray-300">Months to payback</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black text-purple-400 mb-2">94.7%</div>
              <p className="text-sm text-gray-300">Prediction accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 gradient-electric rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">GIU Intelligence</span>
                  <p className="text-sm text-gray-400">Revolutionary EV Fleet AI</p>
                </div>
              </div>
              <div className="space-y-2 text-gray-400 mb-6">
                <p className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span>Only Digital Twin Technology</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-green-500" />
                  <span>Only Federated Learning</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span>Only Explainable AI</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>94.7% ML Accuracy</span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gray-200">Pricing</h3>
              <div className="space-y-3 text-gray-400">
                <Link href="/pricing" className="block hover:text-white transition-colors font-medium">Pricing Plans</Link>
                <Link href="/roi-analysis" className="block hover:text-white transition-colors">ROI Calculator</Link>
                <Link href="/schedule-demo" className="block hover:text-white transition-colors">Schedule Demo</Link>
                <Link href="/contact" className="block hover:text-white transition-colors">Custom Quote</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gray-200">Technology</h3>
              <div className="space-y-3 text-gray-400">
                <Link href="/digital-twin-dashboard" className="block hover:text-white transition-colors">Digital Twin</Link>
                <Link href="/ml-dashboard" className="block hover:text-white transition-colors">ML Platform</Link>
                <Link href="/ai-insights" className="block hover:text-white transition-colors">AI Insights</Link>
                <Link href="/api-docs" className="block hover:text-white transition-colors">API Docs</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-gray-200">Company</h3>
              <div className="space-y-3 text-gray-400">
                <Link href="/auth/login" className="block hover:text-white transition-colors">Login</Link>
                <Link href="/auth/signup" className="block hover:text-white transition-colors font-medium">Get Started</Link>
                <Link href="/contact" className="block hover:text-white transition-colors">Contact</Link>
                <Link href="/support" className="block hover:text-white transition-colors">Support</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 GIU Intelligence. Revolutionary EV fleet AI platform.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <span className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SOC 2 Certified</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>Patent Pending</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>GDPR Compliant</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Final CTA */}
      <div className="text-center">
        <Link 
          href={`/auth/signup?plan=${
            customerType === 'utilities' ? 'grid-intelligence' :
            customerType === 'fleets' ? 'fleet-intelligence' :
            customerType === 'batteries' ? 'battery-intelligence' :
            'infrastructure-intelligence'
          }&industry=${customerType}`}
          className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-xl text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
        >
          Start Your Free Trial Today
          <ArrowRight className="inline-block w-6 h-6 ml-3" />
        </Link>
      </div>
    </div>
  );
} 