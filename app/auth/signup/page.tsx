'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Car, 
  Battery, 
  Navigation, 
  Check, 
  ArrowRight,
  CheckCircle,
  Award,
  Users,
  Cpu,
  Globe,
  TrendingUp,
  User,
  Zap,
  Sparkles,
  Shield,
  Clock,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get URL parameters
  const planParam = searchParams.get('plan') || 'fleet-intelligence';
  const industryParam = searchParams.get('industry') || 'fleets';
  
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Company Info
    company: '',
    role: '',
    companySize: '',
    industry: industryParam,
    
    // Plan Selection
    selectedPlan: planParam,
    billingCycle: 'annual',
    addOns: [],
    
    // Additional Info
    fleetSize: '',
    currentSolution: '',
    painPoints: [],
    timeline: '1-3 months',
    
    // Compliance
    terms: false,
    privacy: false,
    marketing: false
  });

  // Industry configurations (matching pricing page)
  const customerTypes = {
    utilities: {
      label: 'Electric Utilities',
      description: 'Grid operators & energy companies',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-indigo-600',
      primaryFocus: 'Grid Integration & V2G Revenue',
      keyBenefits: ['40% reduction in peak demand costs', '$2.3M annual V2G revenue potential', '99.9% grid stability during peak events'],
      specificQuestions: [
        { key: 'gridCapacity', label: 'Current Grid Capacity (MW)', type: 'select', options: ['<50 MW', '50-200 MW', '200-500 MW', '500+ MW'] },
        { key: 'regulatoryBody', label: 'Primary Regulatory Body', type: 'select', options: ['FERC', 'State PUC', 'Municipal Authority', 'Other'] }
      ]
    },
    fleets: {
      label: 'Fleet Operators',
      description: 'Commercial & logistics fleets',
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradientFrom: 'from-green-600',
      gradientTo: 'to-emerald-600',
      primaryFocus: 'Operational Efficiency & Cost Reduction',
      keyBenefits: ['28% reduction in operational costs', '94% vehicle uptime guarantee', '35% improvement in route efficiency'],
      specificQuestions: [
        { key: 'fleetSize', label: 'Current Fleet Size', type: 'select', options: ['10-25 vehicles', '26-50 vehicles', '51-100 vehicles', '101-500 vehicles', '500+ vehicles'] },
        { key: 'fleetType', label: 'Primary Fleet Type', type: 'select', options: ['Delivery/Logistics', 'Public Transit', 'Corporate Fleet', 'Utility Vehicles', 'Emergency Services'] }
      ]
    },
    batteries: {
      label: 'Battery Manufacturers',
      description: 'Battery OEMs & technology companies',
      icon: Battery,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradientFrom: 'from-purple-600',
      gradientTo: 'to-pink-600',
      primaryFocus: 'Performance Optimization & Lifecycle Management',
      keyBenefits: ['25% extended battery lifespan', '60% reduction in warranty claims', '91% accuracy in failure prediction'],
      specificQuestions: [
        { key: 'batteryTypes', label: 'Battery Technologies', type: 'select', options: ['Lithium-ion', 'Solid State', 'Lithium Iron Phosphate', 'Multiple Technologies'] },
        { key: 'productionVolume', label: 'Annual Production Volume', type: 'select', options: ['<1,000 units', '1K-10K units', '10K-100K units', '100K+ units'] }
      ]
    },
    infrastructure: {
      label: 'Infrastructure Providers',
      description: 'Charging network operators & developers',
      icon: Navigation,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradientFrom: 'from-orange-600',
      gradientTo: 'to-red-600',
      primaryFocus: 'Network Optimization & Asset Utilization',
      keyBenefits: ['45% increase in station utilization', '$180K additional revenue per station/year', '50% reduction in maintenance costs'],
      specificQuestions: [
        { key: 'stationCount', label: 'Current Station Count', type: 'select', options: ['<10 stations', '10-50 stations', '50-200 stations', '200+ stations'] },
        { key: 'chargingTypes', label: 'Charging Types Offered', type: 'select', options: ['Level 2 only', 'DC Fast Charging', 'Ultra-Fast Charging', 'Multiple Types'] }
      ]
    }
  };

  // Plan configurations
  const planConfigs = {
    'grid-intelligence': {
      name: 'Grid Intelligence',
      badge: 'UTILITIES & ENERGY',
      industry: 'utilities',
      pricing: { monthly: 15000, annual: 12000, setup: 25000 },
      features: ['V2G Protocol Management', 'Peak Demand Forecasting', 'Grid Stability Monitoring', 'Revenue Optimization'],
      compliance: ['NERC CIP', 'FERC Standards', 'ISO 27001', 'SOC 2 Type II']
    },
    'fleet-intelligence': {
      name: 'Fleet Intelligence',
      badge: 'FLEET OPERATORS',
      industry: 'fleets',
      pricing: { monthly: 8500, annual: 6800, setup: 15000 },
      features: ['Real-time Fleet Monitoring', 'Predictive Maintenance', 'AI Route Optimization', 'Energy Cost Analytics'],
      compliance: ['DOT Regulations', 'GDPR', 'SOC 2 Type II', 'ISO 27001']
    },
    'battery-intelligence': {
      name: 'Battery Intelligence',
      badge: 'BATTERY MANUFACTURERS',
      industry: 'batteries',
      pricing: { monthly: 12000, annual: 9600, setup: 20000 },
      features: ['Digital Twin Battery Modeling', 'Chemistry Optimization', 'Degradation Prediction', 'Warranty Cost Reduction'],
      compliance: ['UL Standards', 'IEC 62133', 'ISO 9001', 'RoHS Compliance']
    },
    'infrastructure-intelligence': {
      name: 'Infrastructure Intelligence',
      badge: 'CHARGING NETWORKS',
      industry: 'infrastructure',
      pricing: { monthly: 10000, annual: 8000, setup: 18000 },
      features: ['Station Placement AI', 'Dynamic Pricing Optimization', 'Demand Forecasting', 'Revenue Analytics'],
      compliance: ['OCPP Standards', 'PCI DSS', 'GDPR', 'Local Building Codes']
    }
  };

  const currentCustomerType = customerTypes[formData.industry];
  const currentPlan = planConfigs[formData.selectedPlan];
  const Icon = currentCustomerType.icon;

  // Form validation
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid business email address';
        if (formData.phone && !/^[\+]?[\s\(\)\-\d]+$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
        break;
        
      case 2:
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.role) newErrors.role = 'Please select your role';
        if (!formData.companySize) newErrors.companySize = 'Please select company size';
        currentCustomerType.specificQuestions.forEach(q => {
          if (!formData[q.key]) newErrors[q.key] = `${q.label} is required`;
        });
        break;
        
      case 3:
        if (!formData.timeline) newErrors.timeline = 'Please select implementation timeline';
        break;
        
      case 4:
        if (!formData.terms) newErrors.terms = 'You must accept the terms of service';
        if (!formData.privacy) newErrors.privacy = 'You must accept the privacy policy';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call with proper delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Store signup data
      const userData = {
        id: Date.now().toString(),
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        company: formData.company,
        role: formData.role,
        industry: formData.industry,
        plan: formData.selectedPlan,
        registrationDate: new Date().toISOString(),
        trialExpiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      localStorage.setItem('signupData', JSON.stringify(formData));
      localStorage.setItem('authToken', `token_${Date.now()}`);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect to welcome page
      router.push('/welcome?new=true');
      
    } catch (error) {
      console.error('Signup failed:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Contact Information';
      case 2: return 'Organization Details';
      case 3: return 'Implementation Planning';
      case 4: return 'Account Activation';
      default: return 'Registration';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GIU Intelligence
                </span>
                <p className="text-sm text-gray-600 font-medium">Enterprise Registration</p>
              </div>
            </div>
            
            {/* Enhanced Progress Steps */}
            <div className="hidden md:flex items-center space-x-3">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step === currentStep 
                        ? `bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} text-white shadow-lg`
                        : step < currentStep
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step < currentStep ? <Check className="w-5 h-5" /> : step}
                    </div>
                    <span className={`text-xs font-medium mt-1 ${
                      step === currentStep ? currentCustomerType.color : 'text-gray-500'
                    }`}>
                      {getStepTitle(step)}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-3 rounded-full transition-all duration-300 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Enhanced Left Side - Plan Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8 border border-gray-100">
              {/* Selected Industry */}
              <div className={`inline-flex items-center space-x-3 ${currentCustomerType.bgColor} rounded-full px-6 py-3 mb-6`}>
                <Icon className={`w-6 h-6 ${currentCustomerType.color}`} />
                <span className={`text-sm font-bold ${currentCustomerType.color} uppercase tracking-wide`}>
                  {currentCustomerType.label}
                </span>
              </div>

              {/* Selected Plan */}
              <h3 className="text-3xl font-black text-gray-900 mb-3">{currentPlan.name}</h3>
              <p className="text-gray-700 mb-6 font-medium">{currentCustomerType.primaryFocus}</p>

              {/* Enhanced Pricing */}
              <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
                <div className="flex items-baseline mb-3">
                  <span className="text-4xl font-black text-gray-900">
                    ${(formData.billingCycle === 'annual' ? currentPlan.pricing.annual : currentPlan.pricing.monthly).toLocaleString()}
                  </span>
                  <span className="ml-2 text-gray-600 font-medium">/month</span>
                </div>
                {formData.billingCycle === 'annual' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-bold">
                      Save ${((currentPlan.pricing.monthly - currentPlan.pricing.annual) * 12).toLocaleString()}/year
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  Implementation: ${currentPlan.pricing.setup.toLocaleString()} (one-time)
                </p>
              </div>

              {/* Key Benefits */}
              <div className="mb-8">
                <h4 className="font-black text-gray-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                  Proven Results
                </h4>
                <div className="space-y-3">
                  {currentCustomerType.keyBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-800 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Features */}
              <div className="mb-8">
                <h4 className="font-black text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 text-blue-500 mr-2" />
                  Core Platform Features
                </h4>
                <div className="space-y-2">
                  {currentPlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Security */}
              <div className="mb-8">
                <h4 className="font-black text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 text-purple-500 mr-2" />
                  Compliance & Security
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentPlan.compliance.map((cert, idx) => (
                    <div key={idx} className="text-xs font-medium text-gray-600 bg-gray-100 rounded-lg px-3 py-2 text-center">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Shield className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-xs font-bold text-gray-700">SOC 2 Certified</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-xs font-bold text-gray-700">14-Day Trial</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Globe className="w-6 h-6 text-purple-500 mb-2" />
                    <span className="text-xs font-bold text-gray-700">GDPR Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Right Side - Form Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
              
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="p-10">
                  <div className="mb-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <User className={`w-8 h-8 ${currentCustomerType.color}`} />
                      <h2 className="text-4xl font-black text-gray-900">Contact Information</h2>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Please provide your professional contact details for account setup
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateFormData('firstName', e.target.value)}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 ${
                            errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          required
                        />
                        {errors.firstName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 ${
                            errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          required
                        />
                        {errors.lastName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Business Email Address *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 ${
                            errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          required
                        />
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Business Phone Number
                      </label>
                      <div className="relative">
                        <Settings className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 ${
                            errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button
                      onClick={nextStep}
                      className={`px-10 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${
                        `bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} hover:shadow-xl transform hover:scale-105`
                      }`}
                    >
                      Continue to Organization Details
                      <ArrowRight className="inline-block w-5 h-5 ml-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Organization Details */}
              {currentStep === 2 && (
                <div className="p-10">
                  <div className="mb-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <Cpu className={`w-8 h-8 ${currentCustomerType.color}`} />
                      <h2 className="text-4xl font-black text-gray-900">Organization Details</h2>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Help us configure {currentPlan.name} for your organization's specific needs
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Organization Name *
                      </label>
                      <div className="relative">
                        <Cpu className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => updateFormData('company', e.target.value)}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 ${
                            errors.company ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                          }`}
                          required
                        />
                        {errors.company && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            {errors.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Your Role *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                          <select
                            value={formData.role}
                            onChange={(e) => updateFormData('role', e.target.value)}
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 appearance-none bg-white ${
                              errors.role ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                            }`}
                            required
                          >
                            <option value="">Select your role</option>
                            <option value="ceo">Chief Executive Officer</option>
                            <option value="cto">Chief Technology Officer</option>
                            <option value="operations">Operations Manager</option>
                            <option value="fleet">Fleet Manager</option>
                            <option value="sustainability">Sustainability Officer</option>
                            <option value="procurement">Procurement Manager</option>
                            <option value="director">Director/VP</option>
                            <option value="other">Other Executive Role</option>
                          </select>
                          {errors.role && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              {errors.role}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          Organization Size *
                        </label>
                        <div className="relative">
                          <Users className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                          <select
                            value={formData.companySize}
                            onChange={(e) => updateFormData('companySize', e.target.value)}
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 appearance-none bg-white ${
                              errors.companySize ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                            }`}
                            required
                          >
                            <option value="">Select organization size</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-1000">201-1,000 employees</option>
                            <option value="1000+">1,000+ employees</option>
                          </select>
                          {errors.companySize && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              {errors.companySize}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Industry-specific questions */}
                    {currentCustomerType.specificQuestions.map((question, idx) => (
                      <div key={question.key}>
                        <label className="block text-sm font-bold text-gray-800 mb-3">
                          {question.label} *
                        </label>
                        <div className="relative">
                          <Icon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                          <select
                            value={formData[question.key] || ''}
                            onChange={(e) => updateFormData(question.key, e.target.value)}
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 appearance-none bg-white ${
                              errors[question.key] ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                            }`}
                            required
                          >
                            <option value="">Select {question.label.toLowerCase()}</option>
                            {question.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {errors[question.key] && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              {errors[question.key]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Current Solution Provider (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.currentSolution}
                        onChange={(e) => updateFormData('currentSolution', e.target.value)}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl font-medium transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Help us understand your current technology stack for seamless migration
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold text-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className={`px-10 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} hover:shadow-xl transform hover:scale-105`}
                    >
                      Continue to Implementation
                      <ArrowRight className="inline-block w-5 h-5 ml-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Implementation Planning */}
              {currentStep === 3 && (
                <div className="p-10">
                  <div className="mb-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className={`w-8 h-8 ${currentCustomerType.color}`} />
                      <h2 className="text-4xl font-black text-gray-900">Implementation Planning</h2>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Configure your {currentPlan.name} implementation timeline and requirements
                    </p>
                  </div>

                  {/* Billing Cycle Selection */}
                  <div className="mb-10">
                    <label className="block text-sm font-bold text-gray-800 mb-4">
                      Billing Preference
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        onClick={() => updateFormData('billingCycle', 'monthly')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                          formData.billingCycle === 'monthly'
                            ? `border-blue-500 bg-blue-50 ring-2 ring-blue-200`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-lg">Monthly Billing</h4>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.billingCycle === 'monthly' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}></div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">Pay monthly with flexibility to scale</p>
                        <div className="text-2xl font-black text-gray-900">
                          ${currentPlan.pricing.monthly.toLocaleString()}/month
                        </div>
                      </button>

                      <button
                        onClick={() => updateFormData('billingCycle', 'annual')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left relative ${
                          formData.billingCycle === 'annual'
                            ? `border-green-500 bg-green-50 ring-2 ring-green-200`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          SAVE 20%
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-lg">Annual Billing</h4>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.billingCycle === 'annual' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                          }`}></div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">Best value with annual commitment</p>
                        <div className="text-2xl font-black text-gray-900">
                          ${currentPlan.pricing.annual.toLocaleString()}/month
                        </div>
                        <p className="text-sm text-green-600 font-bold mt-1">
                          Save ${((currentPlan.pricing.monthly - currentPlan.pricing.annual) * 12).toLocaleString()}/year
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Implementation Timeline */}
                  <div className="mb-10">
                    <label className="block text-sm font-bold text-gray-800 mb-4">
                      Preferred Implementation Timeline *
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { value: 'immediately', label: 'Immediate Start', desc: 'Begin implementation within 1 week', icon: '🚀' },
                        { value: '1-3 months', label: '1-3 Months', desc: 'Planned rollout with preparation time', icon: '📅' },
                        { value: '3-6 months', label: '3-6 Months', desc: 'Strategic long-term implementation', icon: '📊' },
                        { value: 'just-exploring', label: 'Evaluation Phase', desc: 'Currently assessing options', icon: '🔍' }
                      ].map(timeline => (
                        <button
                          key={timeline.value}
                          onClick={() => updateFormData('timeline', timeline.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.timeline === timeline.value
                              ? `border-blue-500 bg-blue-50 ring-2 ring-blue-200`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{timeline.icon}</span>
                            <div>
                              <h4 className="font-bold text-gray-900">{timeline.label}</h4>
                              <p className="text-sm text-gray-600">{timeline.desc}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.timeline && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.timeline}
                      </p>
                    )}
                  </div>

                  {/* Key Challenges */}
                  <div className="mb-10">
                    <label className="block text-sm font-bold text-gray-800 mb-4">
                      Primary Business Challenges (Select all that apply)
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        'High operational costs',
                        'Regulatory compliance',
                        'System integration complexity',
                        'Data visibility limitations',
                        'Scalability constraints',
                        'Maintenance inefficiencies',
                        'Performance optimization',
                        'Risk management'
                      ].map((challenge) => (
                        <label key={challenge} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={formData.painPoints.includes(challenge)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData('painPoints', [...formData.painPoints, challenge]);
                              } else {
                                updateFormData('painPoints', formData.painPoints.filter(p => p !== challenge));
                              }
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-800">{challenge}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold text-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className={`px-10 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} hover:shadow-xl transform hover:scale-105`}
                    >
                      Finalize Registration
                      <ArrowRight className="inline-block w-5 h-5 ml-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Account Activation */}
              {currentStep === 4 && (
                <div className="p-10">
                  <div className="mb-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className={`w-8 h-8 ${currentCustomerType.color}`} />
                      <h2 className="text-4xl font-black text-gray-900">Account Activation</h2>
                    </div>
                    <p className="text-gray-600 text-lg">
                      Review your registration details and complete account setup
                    </p>
                  </div>

                  {/* Registration Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Registration Summary</h3>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4">Contact Information</h4>
                        <div className="space-y-2 text-gray-700">
                          <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                          <p><strong>Email:</strong> {formData.email}</p>
                          {formData.phone && <p><strong>Phone:</strong> {formData.phone}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4">Organization</h4>
                        <div className="space-y-2 text-gray-700">
                          <p><strong>Company:</strong> {formData.company}</p>
                          <p><strong>Role:</strong> {formData.role}</p>
                          <p><strong>Size:</strong> {formData.companySize}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-900">{currentPlan.name}</h4>
                          <p className="text-gray-600">{formData.billingCycle === 'annual' ? 'Annual' : 'Monthly'} Billing</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-gray-900">
                            ${(formData.billingCycle === 'annual' ? currentPlan.pricing.annual : currentPlan.pricing.monthly).toLocaleString()}/month
                          </div>
                          {formData.billingCycle === 'annual' && (
                            <p className="text-sm text-green-600 font-bold">
                              Annual savings: ${((currentPlan.pricing.monthly - currentPlan.pricing.annual) * 12).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trial Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 mb-10">
                    <div className="flex items-start space-x-4">
                      <Clock className="w-8 h-8 text-green-600 mt-1" />
                      <div>
                        <h4 className="text-xl font-bold text-green-900 mb-3">14-Day Enterprise Trial</h4>
                        <div className="space-y-2 text-green-800">
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Full access to all {currentPlan.name} features
                          </p>
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Dedicated implementation support
                          </p>
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            No charges until trial ends
                          </p>
                          <p className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Cancel anytime with no penalties
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legal Agreements */}
                  <div className="space-y-6 mb-10">
                    <div className="p-6 border-2 border-gray-200 rounded-xl">
                      <label className="flex items-start space-x-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.terms}
                          onChange={(e) => updateFormData('terms', e.target.checked)}
                          className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          required
                        />
                        <div>
                          <span className="font-bold text-gray-900">
                            I agree to the Terms of Service and Master Service Agreement *
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            By checking this box, you agree to our enterprise terms of service and master service agreement governing platform usage.
                          </p>
                        </div>
                      </label>
                      {errors.terms && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.terms}
                        </p>
                      )}
                    </div>

                    <div className="p-6 border-2 border-gray-200 rounded-xl">
                      <label className="flex items-start space-x-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.privacy}
                          onChange={(e) => updateFormData('privacy', e.target.checked)}
                          className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          required
                        />
                        <div>
                          <span className="font-bold text-gray-900">
                            I acknowledge the Privacy Policy and Data Processing Agreement *
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Understand how we collect, process, and protect your organization's data in compliance with GDPR and industry standards.
                          </p>
                        </div>
                      </label>
                      {errors.privacy && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.privacy}
                        </p>
                      )}
                    </div>

                    <div className="p-6 bg-gray-50 rounded-xl">
                      <label className="flex items-start space-x-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.marketing}
                          onChange={(e) => updateFormData('marketing', e.target.checked)}
                          className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">
                            Keep me informed about product updates and industry insights
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Receive valuable industry reports, platform updates, and best practices (optional).
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Error Display */}
                  {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <p className="text-red-800 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        {errors.submit}
                      </p>
                    </div>
                  )}

                  <div className="mt-12 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold text-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className={`px-12 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : `bg-gradient-to-r ${currentCustomerType.gradientFrom} ${currentCustomerType.gradientTo} hover:shadow-xl transform hover:scale-105`
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                          Activating Your Account...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 mr-3" />
                          Activate Enterprise Account
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Security Footer */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-8 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="w-4 h-4 text-purple-500" />
                <span>GDPR Compliant</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 GIU Intelligence. Enterprise-grade security and compliance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 