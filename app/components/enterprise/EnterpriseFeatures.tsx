/// <reference path="../../types/react.d.ts" />
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Shield, Database, Zap, Cloud, Server, LineChart } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, className }) => {
  const cardRef = useRef(null as HTMLDivElement | null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: any) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const rotateX = (y - 0.5) * 10; // -5 to 5 degrees
    const rotateY = (x - 0.5) * -10; // -5 to 5 degrees
    
    setRotation({ x: rotateX, y: rotateY });
  };
  
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };
  
  return (
    <div 
      ref={cardRef}
      className={`parallax-card glass-effect hover-scale p-6 rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease'
      }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-3 mb-4 rounded-full bg-blue-50">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const EnterpriseFeatures: React.FC = () => {
  return (
    <div className="py-16 px-6 bg-grid-blue">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">Enterprise-Grade Technology</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with cutting-edge technology to provide unmatched performance, security, and reliability.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-blue-600" />}
            title="Enterprise Security"
            description="Bank-level encryption and security protocols to keep your data safe. Regular security audits and compliance with industry standards."
          />
          
          <FeatureCard
            icon={<Zap className="h-6 w-6 text-yellow-600" />}
            title="High Performance"
            description="Lightning-fast response times with optimized code and infrastructure. Handle thousands of concurrent users without slowdowns."
          />
          
          <FeatureCard
            icon={<Database className="h-6 w-6 text-emerald-600" />}
            title="Scalable Architecture"
            description="Infrastructure that grows with your needs. Add vehicles, users, and charging stations without performance impact."
          />
          
          <FeatureCard
            icon={<Server className="h-6 w-6 text-red-600" />}
            title="99.9% Uptime SLA"
            description="Redundant systems and automatic failover ensure your platform is always available when you need it."
          />
          
          <FeatureCard
            icon={<Cloud className="h-6 w-6 text-purple-600" />}
            title="Cloud Infrastructure"
            description="Deployed on enterprise-grade cloud infrastructure with global distribution for minimal latency."
          />
          
          <FeatureCard
            icon={<LineChart className="h-6 w-6 text-indigo-600" />}
            title="AI Analytics"
            description="Advanced machine learning algorithms provide predictive maintenance, energy optimization, and smart routing."
          />
        </div>
        
        <div className="mt-12 text-center">
          <button className="btn-glow bg-blue-600 text-white py-3 px-8 rounded-full font-medium hover:bg-blue-700 transition-all">
            Learn More About Our Technology
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseFeatures; 