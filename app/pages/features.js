"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeaturesPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var Feature = function (_a) {
    var icon = _a.icon, title = _a.title, description = _a.description, className = _a.className;
    return (<div className={"card-premium p-6 hover-scale ".concat(className)}>
    <div className="flex flex-col h-full">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 flex-grow">{description}</p>
    </div>
  </div>);
};
function FeaturesPage() {
    return (<div className="min-h-screen bg-dots-indigo">
      {/* Hero Section */}
      <div className="bg-white pt-20 pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Powerful Features</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              Our EV charging infrastructure platform offers comprehensive tools and capabilities to manage your fleet efficiently.
            </p>
          </div>
        </div>
      </div>
      
      {/* Core Features Section */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Core Platform Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your EV charging infrastructure in one integrated platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature icon={<div className="p-3 bg-blue-100 rounded-full w-fit"><lucide_react_1.Zap className="h-6 w-6 text-blue-600"/></div>} title="Smart Charging Management" description="Optimize charging schedules based on energy costs, vehicle usage patterns, and grid demand to minimize operational costs."/>
            
            <Feature icon={<div className="p-3 bg-green-100 rounded-full w-fit"><lucide_react_1.BarChart className="h-6 w-6 text-green-600"/></div>} title="Real-time Analytics" description="Comprehensive dashboard with real-time analytics on energy usage, costs, charging station status, and vehicle performance."/>
            
            <Feature icon={<div className="p-3 bg-indigo-100 rounded-full w-fit"><lucide_react_1.Shield className="h-6 w-6 text-indigo-600"/></div>} title="Security Framework" description="Enterprise-grade security to protect charging infrastructure, vehicle data, and user information from threats."/>
            
            <Feature icon={<div className="p-3 bg-purple-100 rounded-full w-fit"><lucide_react_1.Smartphone className="h-6 w-6 text-purple-600"/></div>} title="Mobile Applications" description="Driver apps for iOS and Android with route planning, charging station locations, and real-time vehicle status updates."/>
            
            <Feature icon={<div className="p-3 bg-amber-100 rounded-full w-fit"><lucide_react_1.Clock className="h-6 w-6 text-amber-600"/></div>} title="Predictive Maintenance" description="AI-powered predictive maintenance alerts to prevent downtime and extend the lifespan of vehicles and charging infrastructure."/>
            
            <Feature icon={<div className="p-3 bg-red-100 rounded-full w-fit"><lucide_react_1.Settings className="h-6 w-6 text-red-600"/></div>} title="Fleet Management" description="Comprehensive fleet management tools including vehicle assignment, driver scheduling, and performance tracking."/>
          </div>
        </div>
      </div>
      
      {/* Advanced Features */}
      <div className="py-16 px-6 bg-grid-blue">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Advanced Capabilities</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Cutting-edge features that set our platform apart from the competition.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <lucide_react_1.ArrowUp className="h-8 w-8 text-blue-600"/>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Dynamic Route Optimization</h3>
                  <p className="text-gray-600 mb-4">
                    Our AI-powered route optimization engine considers vehicle range, charging station availability, traffic conditions, and delivery schedules to create the most efficient routes.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Reduces energy consumption by up to 15%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Increases delivery efficiency by 20%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Real-time adjustments based on changing conditions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <lucide_react_1.Sliders className="h-8 w-8 text-purple-600"/>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Intelligent Load Balancing</h3>
                  <p className="text-gray-600 mb-4">
                    Smart load management system that distributes power optimally across charging stations to prevent grid overload and reduce demand charges.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Reduces peak demand by up to 30%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Automatically adjusts to grid conditions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Prioritizes charging based on operational needs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-amber-100 rounded-full">
                    <lucide_react_1.AlertTriangle className="h-8 w-8 text-amber-600"/>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Preventive Diagnostics</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced diagnostic system that identifies potential issues before they cause downtime, keeping your fleet operational at all times.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Reduces vehicle downtime by up to 25%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Early detection of battery issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Automated maintenance scheduling</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="glass-effect p-8 rounded-xl">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="p-4 bg-green-100 rounded-full">
                    <lucide_react_1.Search className="h-8 w-8 text-green-600"/>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Sustainability Insights</h3>
                  <p className="text-gray-600 mb-4">
                    Detailed environmental impact reporting that quantifies CO2 reductions, energy savings, and other sustainability metrics for your EV fleet.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>ESG reporting for stakeholders</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Carbon offset tracking and certification</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Regulatory compliance documentation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Integration Capabilities */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform connects with your existing systems to create a unified ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-premium p-6 text-center">
              <div className="flex justify-center mb-4">
                <img src="https://logowik.com/content/uploads/images/salesforce-inc3324.logowik.com.webp" alt="Salesforce" className="h-12"/>
              </div>
              <h3 className="text-lg font-medium mb-2">Salesforce</h3>
              <p className="text-gray-600">Integrate fleet data with your CRM for enhanced customer service and reporting</p>
            </div>
            
            <div className="card-premium p-6 text-center">
              <div className="flex justify-center mb-4">
                <img src="https://logosmarcas.net/wp-content/uploads/2021/03/SAP-Logo.png" alt="SAP" className="h-12"/>
              </div>
              <h3 className="text-lg font-medium mb-2">SAP</h3>
              <p className="text-gray-600">Connect with your SAP systems for seamless financial and operational data flow</p>
            </div>
            
            <div className="card-premium p-6 text-center">
              <div className="flex justify-center mb-4">
                <img src="https://www.pngkey.com/png/full/19-191718_microsoft-dynamics-365-logo-microsoft-dynamics-365-logo.png" alt="Microsoft Dynamics" className="h-12"/>
              </div>
              <h3 className="text-lg font-medium mb-2">Microsoft Dynamics</h3>
              <p className="text-gray-600">Full integration with Microsoft Dynamics for comprehensive business management</p>
            </div>
            
            <div className="card-premium p-6 text-center">
              <div className="flex justify-center mb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Google_Sheets_logo_%282014-2020%29.svg/1498px-Google_Sheets_logo_%282014-2020%29.svg.png" alt="Google Workspace" className="h-12"/>
              </div>
              <h3 className="text-lg font-medium mb-2">Google Workspace</h3>
              <p className="text-gray-600">Sync data with Google Sheets and other Google Workspace applications</p>
            </div>
            
            <div className="card-premium p-6 text-center">
              <div className="flex justify-center mb-4">
                <img src="https://cdn.worldvectorlogo.com/logos/quickbooks-1.svg" alt="QuickBooks" className="h-12"/>
              </div>
              <h3 className="text-lg font-medium mb-2">QuickBooks</h3>
              <p className="text-gray-600">Connect with QuickBooks for streamlined accounting and expense tracking</p>
            </div>
            
            <div className="card-premium p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <lucide_react_1.RefreshCw className="h-6 w-6 text-blue-600"/>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Custom API</h3>
              <p className="text-gray-600">Flexible API enables integration with virtually any system in your technology stack</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience These Features?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contact our team for a personalized demonstration of how our platform can transform your fleet operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-medium transition-all">
              Request a Demo
            </button>
            <button className="bg-transparent border border-white hover:bg-white/10 py-3 px-8 rounded-full font-medium transition-all">
              Download Brochure
            </button>
          </div>
        </div>
      </div>
    </div>);
}
