import React from 'react';
import { Users, Award, Leaf as Rocket, Clock, Map, Home as Building } from 'lucide-react';

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-dots-indigo">
      {/* Hero Section */}
      <div className="bg-white pt-20 pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Our Company</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              Leading the transition to sustainable fleet mobility with cutting-edge EV charging infrastructure and management solutions.
            </p>
          </div>
        </div>
      </div>
      
      {/* Mission & Vision */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="card-premium p-8 card-3d">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Our Mission</h2>
              <p className="text-gray-700 mb-6">
                To accelerate the world's transition to sustainable transportation by providing intelligent 
                EV charging infrastructure and management solutions that maximize efficiency and minimize 
                environmental impact.
              </p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Rocket className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-gray-800 font-medium">
                  "We're committed to making electric mobility the new standard for fleet operations worldwide."
                </p>
              </div>
            </div>
            
            <div className="card-premium p-8 card-3d">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Our Vision</h2>
              <p className="text-gray-700 mb-6">
                A world where all commercial fleets operate on clean energy, supported by intelligent 
                infrastructure that optimizes resources and eliminates emissions.
              </p>
              <div className="p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-gray-800 font-medium">
                  "Creating a sustainable future through innovation in EV fleet management technology."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Company History Timeline */}
      <div className="py-16 px-6 bg-grid-blue">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">
              From a small startup to an industry leader in EV charging infrastructure.
            </p>
          </div>
          
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
            
            {/* Timeline Items */}
            <div className="space-y-12">
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-7 h-7 rounded-full bg-blue-600 border-4 border-white z-10"></div>
                <div className="ml-auto mr-auto md:ml-0 md:mr-[calc(50%+2rem)] md:pr-8 w-full md:w-[calc(50%-2rem)] card-premium p-6 mb-10">
                  <div className="mb-2 font-semibold text-blue-600">2018</div>
                  <h3 className="text-xl font-bold mb-2">Company Founded</h3>
                  <p className="text-gray-600">
                    GIU was founded with a vision to revolutionize EV charging infrastructure for commercial fleets.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-7 h-7 rounded-full bg-blue-600 border-4 border-white z-10"></div>
                <div className="ml-auto mr-auto md:mr-0 md:ml-[calc(50%+2rem)] md:pl-8 w-full md:w-[calc(50%-2rem)] card-premium p-6 mb-10">
                  <div className="mb-2 font-semibold text-blue-600">2019</div>
                  <h3 className="text-xl font-bold mb-2">First Major Contract</h3>
                  <p className="text-gray-600">
                    Secured first major contract with a Fortune 500 delivery company to electrify their fleet.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-7 h-7 rounded-full bg-blue-600 border-4 border-white z-10"></div>
                <div className="ml-auto mr-auto md:ml-0 md:mr-[calc(50%+2rem)] md:pr-8 w-full md:w-[calc(50%-2rem)] card-premium p-6 mb-10">
                  <div className="mb-2 font-semibold text-blue-600">2021</div>
                  <h3 className="text-xl font-bold mb-2">AI Integration</h3>
                  <p className="text-gray-600">
                    Launched industry-first AI-driven charging optimization and predictive maintenance system.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-7 h-7 rounded-full bg-blue-600 border-4 border-white z-10"></div>
                <div className="ml-auto mr-auto md:mr-0 md:ml-[calc(50%+2rem)] md:pl-8 w-full md:w-[calc(50%-2rem)] card-premium p-6 mb-10">
                  <div className="mb-2 font-semibold text-blue-600">2022</div>
                  <h3 className="text-xl font-bold mb-2">International Expansion</h3>
                  <p className="text-gray-600">
                    Expanded operations to Europe and Asia, bringing our technology to global markets.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -mt-3 w-7 h-7 rounded-full bg-green-600 border-4 border-white z-10"></div>
                <div className="ml-auto mr-auto md:ml-0 md:mr-[calc(50%+2rem)] md:pr-8 w-full md:w-[calc(50%-2rem)] card-premium p-6 mb-10">
                  <div className="mb-2 font-semibold text-green-600">Today</div>
                  <h3 className="text-xl font-bold mb-2">Industry Leader</h3>
                  <p className="text-gray-600">
                    Now serving over 500 fleets globally with state-of-the-art EV charging infrastructure and management solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Leadership Team */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the experienced team driving our mission to transform fleet electrification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Emily Chen",
                title: "Chief Executive Officer",
                bio: "Former Tesla executive with 15+ years experience in EV technology and infrastructure development.",
                image: "https://randomuser.me/api/portraits/women/42.jpg"
              },
              {
                name: "Michael Rodriguez",
                title: "Chief Technology Officer",
                bio: "Led development of breakthrough charging technologies at Stanford's Energy Innovation Lab.",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                name: "Sarah Johnson",
                title: "Chief Operations Officer",
                bio: "Expert in global supply chain management with experience scaling operations across continents.",
                image: "https://randomuser.me/api/portraits/women/68.jpg"
              },
              {
                name: "David Park",
                title: "Chief Product Officer",
                bio: "Award-winning product designer who has revolutionized user experience in fleet management software.",
                image: "https://randomuser.me/api/portraits/men/29.jpg"
              },
              {
                name: "Amara Okafor",
                title: "VP of Business Development",
                bio: "Secured partnerships with 7 of the 10 largest logistics companies in North America and Europe.",
                image: "https://randomuser.me/api/portraits/women/24.jpg"
              },
              {
                name: "James Wilson",
                title: "VP of Sustainability",
                bio: "Environmental scientist dedicated to maximizing the positive climate impact of our technologies.",
                image: "https://randomuser.me/api/portraits/men/59.jpg"
              }
            ].map((leader, index) => (
              <div key={index} className="card-premium p-6 hover-scale">
                <div className="aspect-square w-full mb-6 overflow-hidden rounded-xl">
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{leader.title}</p>
                <p className="text-gray-600">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Locations */}
      <div className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="section-accent">
                <h2 className="text-3xl font-bold mb-6">Global Presence</h2>
              </div>
              <p className="text-lg text-gray-700 mb-8">
                With headquarters in San Francisco and offices across North America, Europe, and Asia, 
                we provide local support while delivering global solutions.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start glass-effect p-4 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">San Francisco</h3>
                    <p className="text-gray-600">Global Headquarters</p>
                  </div>
                </div>
                
                <div className="flex items-start glass-effect p-4 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">New York</h3>
                    <p className="text-gray-600">East Coast Operations</p>
                  </div>
                </div>
                
                <div className="flex items-start glass-effect p-4 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">London</h3>
                    <p className="text-gray-600">European Headquarters</p>
                  </div>
                </div>
                
                <div className="flex items-start glass-effect p-4 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold">Singapore</h3>
                    <p className="text-gray-600">Asia-Pacific Operations</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 card-premium rounded-xl overflow-hidden">
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <Map className="h-32 w-32 text-blue-300" />
                  </div>
                </div>
                
                {/* Location Dots */}
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full left-[20%] top-[25%] animate-pulse"></div>
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full left-[30%] top-[30%] animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full left-[45%] top-[22%] animate-pulse" style={{ animationDelay: "1s" }}></div>
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full left-[75%] top-[40%] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action - Join Our Team */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
          <p className="text-xl mb-8 opacity-90">
            We're always looking for talented individuals passionate about sustainable transportation and cutting-edge technology.
          </p>
          <div className="flex justify-center">
            <button className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-medium transition-all">
              View Career Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 