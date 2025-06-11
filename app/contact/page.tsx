"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  ArrowRight, 
  Check, 
  User, 
  Building, 
  MessageSquare,
  Shield,
  Zap,
  Users,
  Award,
  Calendar,
  Headphones,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ContactFormSchema, ContactFormData, ContactSubmissionResponse } from '../types/forms';
import { useForm } from '../hooks/useForm';

export default function ContactPage() {
  const [formState, formActions] = useForm<ContactFormData>({
    schema: ContactFormSchema,
    onSubmit: handleFormSubmit,
    initialValues: {
      name: '',
      email: '',
      company: '',
      role: '',
      phone: '',
      message: '',
      inquiryType: 'general',
    },
  });

  async function handleFormSubmit(data: ContactFormData) {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit form');
    }

    const result: ContactSubmissionResponse = await response.json();
    console.log('Contact form submitted successfully:', result);
  }

  // Office locations data
  const officeLocations = [
    {
      name: "Global Headquarters",
      address: "300 Technology Square, Cambridge, MA 02139, United States",
      phone: "+1 (617) 555-1234",
      email: "headquarters@giuev.com",
      hours: "Monday - Friday: 8:00 AM - 7:00 PM EST",
      description: "North American Operations & R&D Center"
    },
    {
      name: "European Operations Center",
      address: "Friedrichstraße 123, 10117 Berlin, Germany",
      phone: "+49 30 987654321",
      email: "europe@giuev.com",
      hours: "Monday - Friday: 8:00 AM - 6:00 PM CET",
      description: "European Market & Regulatory Affairs"
    },
    {
      name: "Asia Pacific Hub",
      address: "One Raffles Quay, Level 35, Singapore 048583",
      phone: "+65 6789 1234",
      email: "apac@giuev.com",
      hours: "Monday - Friday: 8:00 AM - 6:00 PM SGT",
      description: "Asia Pacific Expansion & Partnerships"
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'enterprise', label: 'Enterprise Solutions' },
    { value: 'partnership', label: 'Partnership Opportunities' },
    { value: 'support', label: 'Technical Support' },
    { value: 'media', label: 'Media & Press' },
    { value: 'careers', label: 'Career Opportunities' }
  ];

  const supportChannels = [
    {
      title: "Enterprise Sales",
      description: "Custom EV charging solutions for large-scale deployments",
      contact: "sales@giuev.com",
      phone: "+1 (617) 555-1235",
      hours: "Monday - Friday, 8:00 AM - 7:00 PM EST",
      icon: <Building className="h-8 w-8" />,
      color: "blue"
    },
    {
      title: "Technical Support",
      description: "24/7 technical assistance for operational systems",
      contact: "support@giuev.com", 
      phone: "+1 (617) 555-1236",
      hours: "24/7 Global Coverage",
      icon: <Headphones className="h-8 w-8" />,
      color: "green"
    },
    {
      title: "Partnership Office",
      description: "Strategic partnerships and collaboration opportunities",
      contact: "partnerships@giuev.com",
      phone: "+1 (617) 555-1237", 
      hours: "Monday - Friday, 9:00 AM - 6:00 PM EST",
      icon: <Users className="h-8 w-8" />,
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Global EV Charging Infrastructure Leader
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Connect with Our
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Expert Team
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Partner with industry leaders in EV charging technology. Our team of experts is ready to 
            discuss enterprise solutions, technical partnerships, and innovative charging infrastructure.
          </p>
        </motion.div>

        {/* Executive Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {supportChannels.map((channel, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-6 ${
                channel.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                channel.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              }`}>
                {channel.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{channel.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{channel.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <a 
                    href={`mailto:${channel.contact}`} 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    {channel.contact}
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <a 
                    href={`tel:${channel.phone.replace(/\D/g, '')}`} 
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                  >
                    {channel.phone}
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">{channel.hours}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 lg:col-span-3"
          >
            <div className="flex items-center mb-8">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Get in Touch</h2>
                <p className="text-gray-600 dark:text-gray-300">We typically respond within 2 hours during business hours</p>
              </div>
            </div>
            
            {formState.isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-8">
                  <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Message Received!</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-md">
                  Thank you for contacting GIU EV Charging Infrastructure. Our expert team will review 
                  your inquiry and respond within 2 business hours.
                </p>
                <button
                  onClick={formActions.reset}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={formActions.handleSubmit} className="space-y-6">
                {formState.submitError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                      <p className="text-red-700 dark:text-red-400 text-sm">{formState.submitError}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.values.name || ''}
                        onChange={(e) => formActions.setValue('name', e.target.value)}
                        disabled={formState.isSubmitting}
                        placeholder="Your full name"
                        className={`pl-12 w-full py-4 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 ${
                          formState.errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    {formState.errors.name && (
                      <p className="text-sm text-red-500 mt-1">{formState.errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Business Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.values.email || ''}
                        onChange={(e) => formActions.setValue('email', e.target.value)}
                        disabled={formState.isSubmitting}
                        placeholder="your.email@company.com"
                        className={`pl-12 w-full py-4 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 ${
                          formState.errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    {formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{formState.errors.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Company *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formState.values.company || ''}
                        onChange={(e) => formActions.setValue('company', e.target.value)}
                        disabled={formState.isSubmitting}
                        placeholder="Your company name"
                        className={`pl-12 w-full py-4 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 ${
                          formState.errors.company ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    {formState.errors.company && (
                      <p className="text-sm text-red-500 mt-1">{formState.errors.company}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Job Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Award className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={formState.values.role || ''}
                        onChange={(e) => formActions.setValue('role', e.target.value)}
                        disabled={formState.isSubmitting}
                        placeholder="Your job title"
                        className="pl-12 w-full py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formState.values.phone || ''}
                        onChange={(e) => formActions.setValue('phone', e.target.value)}
                        disabled={formState.isSubmitting}
                        placeholder="+1 (555) 123-4567"
                        className={`pl-12 w-full py-4 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 ${
                          formState.errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    {formState.errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{formState.errors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formState.values.inquiryType || 'general'}
                      onChange={(e) => formActions.setValue('inquiryType', e.target.value)}
                      disabled={formState.isSubmitting}
                      className="w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.values.message || ''}
                    onChange={(e) => formActions.setValue('message', e.target.value)}
                    disabled={formState.isSubmitting}
                    rows={6}
                    placeholder="Please describe your EV charging infrastructure requirements, project scope, timeline, or any specific questions you have for our team..."
                    className={`w-full py-4 px-4 bg-gray-50 dark:bg-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 resize-none ${
                      formState.errors.message ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  ></textarea>
                  {formState.errors.message && (
                    <p className="text-sm text-red-500 mt-1">{formState.errors.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className={`group flex items-center justify-center w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 ${
                    formState.isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {formState.isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By submitting this form, you agree to our privacy policy and terms of service. 
                  We respect your privacy and will never share your information.
                </p>
              </form>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 lg:col-span-2"
          >
            <div className="flex items-center mb-8">
              <div className="h-12 w-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Offices</h2>
                <p className="text-gray-600 dark:text-gray-300">World-class support across continents</p>
              </div>
            </div>
            
            <div className="space-y-8">
              {officeLocations.map((office, index) => (
                <div key={index} className="group p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {office.name}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{office.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{office.address}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <a href={`tel:${office.phone.replace(/\D/g, '')}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {office.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <a href={`mailto:${office.email}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {office.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{office.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-start">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Enterprise Security & Compliance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    ISO 27001 certified with SOC 2 Type II compliance. All communications are encrypted 
                    and handled according to enterprise security standards.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Professional FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Common questions from enterprise clients and technology partners
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">What are your enterprise support SLAs?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enterprise clients receive priority support with guaranteed response times: Critical issues within 15 minutes, 
                  high priority within 2 hours, and standard inquiries within 4 business hours.
                </p>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Do you offer white-label solutions?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, we provide comprehensive white-label solutions including custom branding, 
                  API integration, and dedicated infrastructure for enterprise partners and resellers.
                </p>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">What compliance certifications do you maintain?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We maintain ISO 27001, SOC 2 Type II, GDPR compliance, and industry-specific certifications 
                  including OCPP 2.0.1 and Energy Star partnership standards.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">How do you handle data security and privacy?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All data is encrypted at rest and in transit using AES-256 encryption. We maintain 
                  strict data residency requirements and provide detailed audit logs for compliance reporting.
                </p>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Can you integrate with existing fleet management systems?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, our platform offers comprehensive APIs and pre-built integrations with major fleet 
                  management systems, ERP platforms, and energy management solutions.
                </p>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Do you offer professional services and consulting?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our professional services team provides site assessment, infrastructure planning, 
                  deployment consulting, and ongoing optimization services for large-scale implementations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl">
              <FileText className="h-5 w-5 mr-2" />
              <span className="font-medium">Need detailed technical documentation?</span>
              <a href="#" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Access Developer Portal →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 