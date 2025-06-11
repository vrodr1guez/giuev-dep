import React from 'react';

export default function CompanyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About Our Company</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            At GIU, we're dedicated to revolutionizing electric vehicle fleet management through innovative technology 
            solutions. Our mission is to accelerate the transition to sustainable transportation by providing 
            intelligent, efficient, and reliable EV charging infrastructure management.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Story</h2>
          <p className="text-gray-700 mb-6">
            Founded in 2020, GIU emerged from a vision to solve the complex challenges of EV fleet operations. 
            Our team of engineers, data scientists, and industry experts came together with a shared goal: 
            to create a comprehensive platform that optimizes charging operations, reduces costs, and maximizes 
            fleet efficiency.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Our Technology</h2>
          <p className="text-gray-700">
            Our proprietary QUANTUM CHARGE ORCHESTRATOR™ technology leverages advanced AI and machine learning 
            algorithms to predict charging needs, optimize energy consumption, and provide real-time insights 
            for fleet managers. Through continuous innovation, we're setting new standards for what's possible 
            in EV fleet management.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-semibold mb-4">Join Our Team</h2>
          <p className="mb-6">
            We're always looking for talented individuals who share our passion for sustainable transportation 
            and cutting-edge technology. Explore career opportunities and become part of our mission.
          </p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            View Careers
          </button>
        </div>
      </div>
    </div>
  );
} 