import EnterpriseFeatures from '../components/enterprise/EnterpriseFeatures';
import { Shield, Database, BarChart, Settings as Code, Server } from 'lucide-react';

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-dots-indigo">
      {/* Hero Section */}
      <div className="bg-white pt-20 pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Enterprise Technology</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              Built with enterprise-grade technology to provide unmatched performance, security, and reliability for your EV charging infrastructure.
            </p>
            <button className="btn-glow bg-blue-600 text-white py-4 px-8 rounded-full font-medium hover:bg-blue-700 transition-all">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
      
      {/* Enterprise Features */}
      <EnterpriseFeatures />
      
      {/* Technology Stack */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cutting-Edge Technology Stack</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform is built with the latest technologies for maximum performance, security, and scalability.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-premium p-6 text-center card-3d">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-50">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Frontend</h3>
              <ul className="text-gray-600 space-y-2">
                <li>React with Next.js</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Interactive UI</li>
              </ul>
            </div>
            
            <div className="card-premium p-6 text-center card-3d">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-50">
                  <Server className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Backend</h3>
              <ul className="text-gray-600 space-y-2">
                <li>Node.js</li>
                <li>RESTful API</li>
                <li>GraphQL</li>
                <li>Microservices</li>
              </ul>
            </div>
            
            <div className="card-premium p-6 text-center card-3d">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-purple-50">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Data</h3>
              <ul className="text-gray-600 space-y-2">
                <li>PostgreSQL</li>
                <li>Redis Cache</li>
                <li>Time-series DB</li>
                <li>Data Warehousing</li>
              </ul>
            </div>
            
            <div className="card-premium p-6 text-center card-3d">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-amber-50">
                  <BarChart className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <ul className="text-gray-600 space-y-2">
                <li>AI/ML Predictions</li>
                <li>Real-time Metrics</li>
                <li>Custom Reporting</li>
                <li>Data Visualization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Section */}
      <div className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="section-accent">
                <h2 className="text-3xl font-bold mb-6">Enterprise-Grade Security</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                Your data safety is our top priority. Our platform implements multiple layers of security to ensure that your sensitive information remains protected.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">End-to-End Encryption</h3>
                    <p className="text-gray-600">All data is encrypted in transit and at rest using industry-standard encryption protocols.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Regular Security Audits</h3>
                    <p className="text-gray-600">Our systems undergo regular security assessments by independent security firms.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Compliance Certifications</h3>
                    <p className="text-gray-600">We maintain compliance with industry standards and regulations including ISO 27001, SOC 2, and GDPR.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="glass-effect p-8 rounded-2xl w-full max-w-md h-64 flex items-center justify-center">
                <Shield className="h-32 w-32 text-blue-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your EV Charging Infrastructure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our enterprise-grade platform provides everything you need to manage your EV fleet efficiently and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-medium transition-all">
              Request a Demo
            </button>
            <button className="bg-transparent border border-white hover:bg-white/10 py-3 px-8 rounded-full font-medium transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 