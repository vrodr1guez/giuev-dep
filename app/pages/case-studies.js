"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CaseStudiesPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var CaseStudyCard = function (_a) {
    var title = _a.title, company = _a.company, industry = _a.industry, image = _a.image, date = _a.date, author = _a.author, excerpt = _a.excerpt, link = _a.link;
    return (<div className="card-premium overflow-hidden hover-scale">
      <div className="aspect-video w-full overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover"/>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <lucide_react_1.Tag className="h-3 w-3 mr-1"/>
            {industry}
          </div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <lucide_react_1.Calendar className="h-3 w-3 mr-1"/>
            {date}
          </div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <lucide_react_1.User className="h-3 w-3 mr-1"/>
            {author}
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <h4 className="text-lg font-medium text-blue-600 mb-3">{company}</h4>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        
        <a href={link} className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
          Read Case Study
          <lucide_react_1.ArrowRight className="ml-1 h-4 w-4"/>
        </a>
      </div>
    </div>);
};
var ResultBox = function (_a) {
    var title = _a.title, value = _a.value, unit = _a.unit, improvement = _a.improvement, icon = _a.icon;
    return (<div className="card-premium p-6 text-center">
      <div className="flex justify-center mb-4">
        {icon || <lucide_react_1.BarChart className="h-6 w-6 text-blue-600"/>}
      </div>
      <div className="font-bold text-3xl mb-1 gradient-text">{value}{unit && <span className="text-xl">{unit}</span>}</div>
      <p className="text-gray-500 mb-2">{title}</p>
      {improvement && <p className="text-green-600 text-sm font-medium">{improvement}</p>}
    </div>);
};
function CaseStudiesPage() {
    return (<div className="min-h-screen bg-dots-indigo">
      {/* Hero Section */}
      <div className="bg-white pt-20 pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Customer Success Stories</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              See how organizations are transforming their fleets with our EV charging infrastructure solutions.
            </p>
          </div>
        </div>
      </div>
      
      {/* Featured Case Study */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Featured Success Story</h2>
          
          <div className="glass-effect rounded-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2">
                <img src="https://images.unsplash.com/photo-1621797064678-39af97643d32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGVsZWN0cmljJTIwZGVsaXZlcnklMjB2YW58ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60" alt="Global Express Logistics Fleet" className="w-full h-full object-cover"/>
              </div>
              <div className="lg:w-1/2 p-8 lg:p-12">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                  Logistics Industry
                </div>
                <h3 className="text-2xl font-bold mb-2">Global Express Logistics Reduces Operating Costs by 32%</h3>
                <p className="text-gray-600 mb-6">
                  Learn how one of the largest logistics companies in North America transformed their fleet operations by implementing our EV charging infrastructure and management platform.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">32%</div>
                    <div className="text-sm text-gray-500">Cost Reduction</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">78%</div>
                    <div className="text-sm text-gray-500">CO2 Reduction</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">450+</div>
                    <div className="text-sm text-gray-500">Vehicles Electrified</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">5X</div>
                    <div className="text-sm text-gray-500">ROI in 24 Months</div>
                  </div>
                </div>
                
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center">
                  Read Full Case Study
                  <lucide_react_1.ArrowRight className="ml-2 h-4 w-4"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Overview */}
      <div className="py-16 px-6 bg-grid-blue">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Customer Results</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our customers are achieving significant improvements across their operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ResultBox title="Average Cost Reduction" value="28" unit="%" improvement="Based on 50+ deployments" icon={<div className="text-blue-600 text-2xl">💰</div>}/>
            
            <ResultBox title="CO2 Emissions Reduced" value="142K" unit=" tons" improvement="Equivalent to planting 2.3M trees" icon={<div className="text-green-600 text-2xl">🌿</div>}/>
            
            <ResultBox title="Fleet Uptime Improvement" value="23" unit="%" improvement="Through predictive maintenance" icon={<div className="text-purple-600 text-2xl">⚡</div>}/>
            
            <ResultBox title="Avg. ROI Timeframe" value="18" unit=" months" improvement="Faster than industry average" icon={<div className="text-amber-600 text-2xl">📈</div>}/>
          </div>
        </div>
      </div>
      
      {/* All Case Studies */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">More Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CaseStudyCard title="Municipal Fleet Transformation" company="City of Greenfield" industry="Government" image="https://images.unsplash.com/photo-1631758301707-04197e23c08e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxlY3RyaWMlMjBjaXR5JTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" date="June 2023" author="Mark Johnson" excerpt="How a mid-sized city electrified their municipal fleet and saved taxpayers $1.2M annually while reducing emissions by 85%." link="#"/>
            
            <CaseStudyCard title="Last-Mile Delivery Revolution" company="EcoDelivery Inc." industry="Retail" image="https://images.unsplash.com/photo-1619551734325-81aaf323686c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGVsZWN0cmljJTIwdmFufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" date="April 2023" author="Sarah Williams" excerpt="This e-commerce delivery company implemented our solution across 200+ vehicles, improving delivery efficiency by 32%." link="#"/>
            
            <CaseStudyCard title="School Bus Fleet Electrification" company="Westside School District" industry="Education" image="https://images.unsplash.com/photo-1546447147-3fc7a24bc1c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2Nob29sJTIwYnVzfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" date="March 2023" author="Robert Chen" excerpt="How a forward-thinking school district electrified their bus fleet, improved air quality, and created $400k in annual savings." link="#"/>
            
            <CaseStudyCard title="Service Fleet Optimization" company="Sunshine Utilities" industry="Utilities" image="https://images.unsplash.com/photo-1579896902689-3befbdc8623f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXRpbGl0eSUyMHRydWNrfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" date="February 2023" author="Jennifer Lee" excerpt="A regional utility provider transitioned their service fleet to EVs, reducing operating costs while improving service response times." link="#"/>
            
            <CaseStudyCard title="Campus Transportation Revolution" company="Pacific University" industry="Education" image="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y29sbGVnZSUyMGNhbXB1c3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" date="January 2023" author="David Wong" excerpt="How a large university campus electrified their shuttle system and built a charging infrastructure that doubles as a research facility." link="#"/>
            
            <CaseStudyCard title="Rental Fleet Transition" company="GreenCar Rentals" industry="Transportation" image="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGV2JTIwcmVudGFsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" date="December 2022" author="Amanda Taylor" excerpt="This forward-thinking car rental company transformed customer experience with an all-electric fleet and innovative charging solutions." link="#"/>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear directly from the professionals who have implemented our solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="Thomas Anderson" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className="font-bold">Thomas Anderson</h3>
                  <p className="text-sm text-gray-500">Fleet Manager, Global Express Logistics</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The ROI on our EV fleet transition has exceeded our most optimistic projections. The platform has made managing our complex charging needs simple and efficient, and the predictive maintenance features have dramatically reduced our downtown."
              </p>
            </div>
            
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Maria Rodriguez" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className="font-bold">Maria Rodriguez</h3>
                  <p className="text-sm text-gray-500">Sustainability Director, City of Greenfield</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The transition to EV for our municipal fleet was seamless thanks to this platform. The detailed analytics have been invaluable for reporting to our city council, and the cost savings have allowed us to expand the program beyond our initial scope."
              </p>
            </div>
            
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/men/22.jpg" alt="James Wilson" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className="font-bold">James Wilson</h3>
                  <p className="text-sm text-gray-500">Operations Director, EcoDelivery Inc.</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The route optimization features alone have paid for our investment. We've been able to complete 20% more deliveries per charge, and the integration with our existing logistics software was much easier than anticipated."
              </p>
            </div>
            
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/women/33.jpg" alt="Lisa Chen" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className="font-bold">Lisa Chen</h3>
                  <p className="text-sm text-gray-500">CFO, Sunshine Utilities</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "From a financial perspective, this has been one of our most successful technology investments. The detailed TCO analysis provided by the platform has helped us make strategic decisions about expanding our EV fleet conversion."
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Write Your Success Story?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the growing number of organizations transforming their fleets with our EV charging infrastructure solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-medium transition-all">
              Schedule a Consultation
            </button>
            <button className="bg-transparent border border-white hover:bg-white/10 py-3 px-8 rounded-full font-medium transition-all">
              View All Case Studies
            </button>
          </div>
        </div>
      </div>
    </div>);
}
