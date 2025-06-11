"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Home as Building, User, Smartphone, Users, MessageSquare, ArrowRight, Check } from 'lucide-react';
import { PremiumCard } from '../components/ui/premium-card';
import { EnergyFlowAnimation } from '../components/ui/energy-flow-animation';

const ScheduleDemoPage = () => {
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    role: '',
    companySize: '',
    date: '',
    time: '',
    interests: [] as string[],
    message: ''
  });

  const interestOptions = [
    'Charging Station Management',
    'Fleet Optimization',
    'Energy Management',
    'Driver Mobile App',
    'Analytics Dashboard',
    'V2G Integration',
    'Smart Grid Solutions',
    'Premium Features'
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => {
      const interests = [...(prev.interests || [])];
      if (interests.includes(value)) {
        return { ...prev, interests: interests.filter(i => i !== value) };
      } else {
        return { ...prev, interests: [...interests, value] };
      }
    });
  };

  const handleNextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // In a real app, this would send the data to a server
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-16 pb-24">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <EnergyFlowAnimation 
          direction="radial" 
          particleCount={30} 
          color="#3b82f6" 
          intensity="low"
        />
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4"
          >
            Schedule a Personalized Demo
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            Experience the future of EV charging infrastructure management with our premium platform. Let us show you how our technology can revolutionize your operations.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Demo Scheduling Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-2/3"
          >
            <PremiumCard variant="glass" className="overflow-visible">
              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="p-6">
                  {/* Step indicator */}
                  <div className="flex justify-between items-center mb-8 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 transform -translate-y-1/2"></div>
                    {[1, 2, 3].map(stepNumber => (
                      <div key={stepNumber} className="flex flex-col items-center">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10
                          ${step >= stepNumber 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}
                        >
                          {step > stepNumber ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <span className="text-lg font-semibold">{stepNumber}</span>
                          )}
                        </div>
                        <span className={`text-sm mt-2 font-medium ${step >= stepNumber ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                          {stepNumber === 1 ? 'Your Info' : stepNumber === 2 ? 'Demo Preferences' : 'Confirm'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Your Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Role</label>
                          <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Role</option>
                            <option value="Executive">Executive</option>
                            <option value="Manager">Manager</option>
                            <option value="Operations">Operations</option>
                            <option value="IT">IT</option>
                            <option value="Sustainability">Sustainability</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size</label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                              id="companySize"
                              name="companySize"
                              value={formData.companySize}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Size</option>
                              <option value="1-10">1-10 employees</option>
                              <option value="11-50">11-50 employees</option>
                              <option value="51-200">51-200 employees</option>
                              <option value="201-500">201-500 employees</option>
                              <option value="501+">501+ employees</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-8">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          Next Step
                          <ArrowRight size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Demo Preferences */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Demo Preferences</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="date"
                              id="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              min={new Date().toISOString().split('T')[0]}
                              required
                              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Time</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                              id="time"
                              name="time"
                              value={formData.time}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Time</option>
                              <option value="9:00 AM">9:00 AM</option>
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="11:00 AM">11:00 AM</option>
                              <option value="1:00 PM">1:00 PM</option>
                              <option value="2:00 PM">2:00 PM</option>
                              <option value="3:00 PM">3:00 PM</option>
                              <option value="4:00 PM">4:00 PM</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Areas of Interest</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {interestOptions.map(option => (
                            <label key={option} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={formData.interests?.includes(option)}
                                onChange={() => handleCheckboxChange(option)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Information</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Tell us about your specific needs or questions..."
                            rows={4}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          ></textarea>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-8">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow-md hover:shadow-lg"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          Review
                          <ArrowRight size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review and Submit */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Review Your Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Contact Information</h3>
                          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Email:</span> {formData.email}</p>
                          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Phone:</span> {formData.phone || 'Not provided'}</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Company Information</h3>
                          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Company:</span> {formData.company}</p>
                          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Role:</span> {formData.role || 'Not provided'}</p>
                          <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Company Size:</span> {formData.companySize || 'Not provided'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Demo Preferences</h3>
                        <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Date:</span> {formData.date}</p>
                        <p className="text-gray-800 dark:text-gray-200"><span className="font-medium">Time:</span> {formData.time}</p>
                        
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">Areas of Interest:</h4>
                        {formData.interests && formData.interests.length > 0 ? (
                          <ul className="list-disc list-inside text-gray-800 dark:text-gray-200 ml-1">
                            {formData.interests.map(interest => (
                              <li key={interest}>{interest}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No specific areas selected</p>
                        )}
                        
                        {formData.message && (
                          <>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">Additional Information:</h4>
                            <p className="text-gray-800 dark:text-gray-200 text-sm">{formData.message}</p>
                          </>
                        )}
                      </div>
                      
                      <div className="flex justify-between mt-8">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow-md hover:shadow-lg"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          Schedule Demo
                          <Check size={18} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-10 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Demo Scheduled Successfully!</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Thank you for your interest in our EV Charging Infrastructure platform. We've received your request and will be in touch shortly to confirm your demo for <span className="font-semibold">{formData.date}</span> at <span className="font-semibold">{formData.time}</span>.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg inline-flex items-center gap-2"
                  >
                    Return to Homepage
                  </motion.button>
                </motion.div>
              )}
            </PremiumCard>
          </motion.div>
          
          {/* Benefits Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full lg:w-1/3 space-y-6"
          >
            <PremiumCard variant="glass" glowAccent="blue">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Why Schedule a Demo?</h3>
                <ul className="space-y-4">
                  {[
                    'See our premium EV charging infrastructure management in action',
                    'Get personalized insights for your specific business needs',
                    'Experience the user-friendly interface and advanced analytics',
                    'Learn about our smart energy management features',
                    'Discover how our platform can reduce operational costs'
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
                        <Check size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </PremiumCard>
            
            <PremiumCard variant="glass" glowAccent="purple">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">What to Expect</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Personalized Introduction</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">A brief overview of our platform tailored to your industry</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Live Product Tour</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Interactive demonstration of key features and capabilities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Q&A Session</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Opportunity to ask questions and explore specific use cases</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Custom Solution Discussion</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tailored recommendations for your specific needs</p>
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCard>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Have Questions?</h3>
              <p className="mb-4 text-blue-100">Our team is ready to help you with any questions about our platform.</p>
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-blue-200" />
                <a href="mailto:sales@giuev.com" className="text-white hover:underline">sales@giuev.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-blue-200" />
                <a href="tel:+18005551234" className="text-white hover:underline">+1 (800) 555-1234</a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDemoPage; 