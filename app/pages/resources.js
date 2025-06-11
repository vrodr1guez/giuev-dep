"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResourcesPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var fi_1 = require("react-icons/fi");
var fi_2 = require("react-icons/fi");
var ResourceCard = function (_a) {
    var title = _a.title, description = _a.description, type = _a.type, image = _a.image, link = _a.link;
    var typeColors = {
        Guide: 'bg-blue-100 text-blue-800',
        Whitepaper: 'bg-purple-100 text-purple-800',
        Video: 'bg-red-100 text-red-800',
        Webinar: 'bg-green-100 text-green-800',
        Report: 'bg-amber-100 text-amber-800'
    };
    var typeIcons = {
        Guide: <lucide_react_1.FileText className="h-4 w-4 mr-1"/>,
        Whitepaper: <fi_2.FiBook className="h-4 w-4 mr-1"/>,
        Video: <fi_1.FiVideo className="h-4 w-4 mr-1"/>,
        Webinar: <lucide_react_1.Calendar className="h-4 w-4 mr-1"/>,
        Report: <lucide_react_1.FileText className="h-4 w-4 mr-1"/>
    };
    return (<div className="card-premium hover-scale overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover"/>
      </div>
      <div className="p-6">
        <div className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ".concat(typeColors[type])}>
          {typeIcons[type]}
          {type}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <a href={link} className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors">
          Read More
          <lucide_react_1.ArrowRight className="ml-1 h-4 w-4"/>
        </a>
      </div>
    </div>);
};
function ResourcesPage() {
    return (<div className="min-h-screen bg-dots-indigo">
      {/* Hero Section */}
      <div className="bg-white pt-20 pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Resource Center</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              Expert insights, guides, and resources to help you optimize your EV charging infrastructure and fleet operations.
            </p>
            
            <div className="w-full max-w-lg">
              <div className="relative">
                <input type="text" placeholder="Search resources..." className="w-full input-field py-3 pl-4 pr-10"/>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resource Filter */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <lucide_react_1.Filter className="h-5 w-5 text-gray-500 mr-2"/>
              <span className="font-medium text-gray-700">Filter by:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">All</button>
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">Guides</button>
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">Whitepapers</button>
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">Videos</button>
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">Webinars</button>
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium">Reports</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Resources */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Featured Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ResourceCard title="The Complete Guide to EV Fleet Transition" description="Learn how to successfully transition your fleet to electric vehicles with our comprehensive guide." type="Guide" image="https://images.unsplash.com/photo-1593941707882-a56bbc8bf9f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGVsZWN0cmljJTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
            
            <ResourceCard title="Optimizing Charging Infrastructure for Fleet Operations" description="Discover strategies to maximize the efficiency of your charging infrastructure and reduce operational costs." type="Whitepaper" image="https://images.unsplash.com/photo-1558025137-0d8099e6f79b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGVsZWN0cmljJTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
            
            <ResourceCard title="Advanced Route Planning for EV Fleets" description="Watch our tutorial on how to use AI-powered route planning to maximize efficiency and range." type="Video" image="https://images.unsplash.com/photo-1623139185975-1211dd47423a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8ZWxlY3RyaWMlMjB2ZWhpY2xlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
          </div>
        </div>
      </div>
      
      {/* All Resources */}
      <div className="py-16 px-6 bg-grid-blue">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">All Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ResourceCard title="2024 State of EV Fleet Management Report" description="Our annual report on the trends, challenges, and innovations in EV fleet management." type="Report" image="https://images.unsplash.com/photo-1580273764582-73603882ccdf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGVsZWN0cmljJTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
            
            <ResourceCard title="Reducing TCO with Smart Charging Strategies" description="Learn how to minimize total cost of ownership through intelligent charging management." type="Webinar" image="https://images.unsplash.com/photo-1554744512-d6c603f27c54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGVsZWN0cmljJTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
            
            <ResourceCard title="EV Battery Health Management Best Practices" description="Maximize the lifespan of your EV batteries with these expert maintenance tips." type="Guide" image="https://images.unsplash.com/photo-1592942081161-3edabf1c3ba4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzV8fGVsZWN0cmljJTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
            
            <ResourceCard title="Navigating EV Incentives and Tax Credits" description="A comprehensive guide to available incentives, tax credits, and rebates for EV fleet operators." type="Guide" image="https://images.unsplash.com/photo-1621293954908-907159247fc8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjd8fGVsZWN0cmljJTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
            
            <ResourceCard title="The Future of V2G Technology for Fleet Operations" description="Explore how Vehicle-to-Grid technology is creating new revenue opportunities for fleet operators." type="Whitepaper" image="https://images.unsplash.com/photo-1615775036417-970abb8d9bbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTZ8fGVsZWN0cmljJTIwdmVoaWNsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60" link="#"/>
            
            <ResourceCard title="Building a Sustainable Fleet Operation" description="Join our experts as they discuss strategies for creating environmentally sustainable fleet operations." type="Webinar" image="https://images.unsplash.com/photo-1570133435810-6318451dfa2e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTAwfHxlbGVjdHJpYyUyMHZlaGljbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60" link="#"/>
          </div>
          
          <div className="mt-12 text-center">
            <button className="btn-glow bg-blue-600 text-white py-3 px-8 rounded-full font-medium hover:bg-blue-700 transition-all flex items-center mx-auto">
              Load More Resources
              <lucide_react_1.ArrowRight className="ml-2 h-4 w-4"/>
            </button>
          </div>
        </div>
      </div>
      
      {/* Downloads Section */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="glass-effect rounded-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 p-8 lg:p-12">
                <h2 className="text-2xl font-bold mb-4">Download Our EV Fleet ROI Calculator</h2>
                <p className="text-gray-600 mb-6">
                  Our Excel-based calculator helps you project the return on investment for transitioning your fleet to electric vehicles.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="h-5 w-5 text-green-500 mr-2 flex-shrink-0">✓</div>
                    <span>Customizable inputs for your specific fleet</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 text-green-500 mr-2 flex-shrink-0">✓</div>
                    <span>Compare TCO of ICE vs. EV vehicles</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 text-green-500 mr-2 flex-shrink-0">✓</div>
                    <span>Built-in incentive calculations</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 text-green-500 mr-2 flex-shrink-0">✓</div>
                    <span>5-year projection charts</span>
                  </li>
                </ul>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center">
                  <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                  Download Calculator (Excel)
                </button>
              </div>
              <div className="lg:w-1/2 bg-blue-50 p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-2">Also Available</h3>
                  <p className="text-gray-600">More resources to help with your fleet electrification journey</p>
                </div>
                <div className="space-y-4">
                  <a href="#" className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-2 bg-blue-100 rounded-full mr-4">
                      <lucide_react_1.FileText className="h-5 w-5 text-blue-600"/>
                    </div>
                    <div>
                      <h4 className="font-medium">EV Fleet Policy Template</h4>
                      <p className="text-sm text-gray-500">Word document (38KB)</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-2 bg-green-100 rounded-full mr-4">
                      <lucide_react_1.FileText className="h-5 w-5 text-green-600"/>
                    </div>
                    <div>
                      <h4 className="font-medium">Charging Infrastructure Checklist</h4>
                      <p className="text-sm text-gray-500">PDF document (1.2MB)</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-2 bg-purple-100 rounded-full mr-4">
                      <lucide_react_1.FileText className="h-5 w-5 text-purple-600"/>
                    </div>
                    <div>
                      <h4 className="font-medium">EV Driver Handbook Template</h4>
                      <p className="text-sm text-gray-500">PDF document (2.4MB)</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter to receive the latest resources, guides, and industry insights.
          </p>
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="email" placeholder="Your email address" className="flex-grow px-4 py-3 rounded-lg"/>
              <button className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-6 rounded-lg font-medium transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-sm mt-4 opacity-80">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>);
}
