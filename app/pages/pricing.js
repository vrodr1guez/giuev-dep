"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PricingPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var PricingTier = function (_a) {
    var name = _a.name, price = _a.price, description = _a.description, features = _a.features, _b = _a.popular, popular = _b === void 0 ? false : _b, buttonText = _a.buttonText;
    return (<div className={"card-premium p-8 ".concat(popular ? 'border-2 border-blue-500 shadow-xl' : '', " hover-scale")}>
      {popular && (<div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
          Most Popular
        </div>)}
      
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {price !== 'Custom' && <span className="text-gray-500">/month</span>}
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map(function (feature, index) { return (<li key={index} className="flex items-start">
            <lucide_react_1.Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"/>
            <span>{feature}</span>
          </li>); })}
      </ul>
      
      <button className={"w-full py-3 rounded-lg font-medium transition-all ".concat(popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200')}>
        {buttonText}
      </button>
    </div>);
};
function PricingPage() {
    var _a = (0, react_1.useState)('monthly'), billingCycle = _a[0], setBillingCycle = _a[1];
    var toggleBillingCycle = function () {
        setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly');
    };
    return (<div className="min-h-screen bg-dots-indigo">
      {/* Hero Section */}
      <div className="bg-white pt-20 pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              Choose the plan that's right for your fleet. All plans include core platform features with flexible scaling options.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center space-x-4 mb-8">
              <span className={"text-sm font-medium ".concat(billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-500')}>
                Monthly Billing
              </span>
              <button onClick={toggleBillingCycle} className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                <span className={"inline-block h-4 w-4 transform rounded-full bg-white transition ".concat(billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1')}/>
              </button>
              <span className={"text-sm font-medium ".concat(billingCycle === 'annual' ? 'text-blue-600' : 'text-gray-500')}>
                Annual Billing <span className="text-green-500 font-semibold">(Save 20%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Tiers */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingTier name="Starter" price={billingCycle === 'monthly' ? '$1,995' : '$1,596'} description="Perfect for small fleets just beginning their electrification journey." features={[
            "Up to 25 vehicles",
            "Up to 10 charging stations",
            "Basic analytics dashboard",
            "Mobile app for drivers",
            "Standard customer support",
            "Basic route optimization",
            "Monthly reporting"
        ]} buttonText="Get Started"/>
            
            <PricingTier name="Professional" price={billingCycle === 'monthly' ? '$3,995' : '$3,196'} description="Ideal for growing fleets with more advanced management needs." features={[
            "Up to 100 vehicles",
            "Up to 30 charging stations",
            "Advanced analytics & insights",
            "Mobile app with premium features",
            "Priority customer support",
            "AI-powered route optimization",
            "Advanced scheduling tools",
            "Real-time power management",
            "Weekly reporting"
        ]} popular={true} buttonText="Start Free Trial"/>
            
            <PricingTier name="Enterprise" price="Custom" description="Tailored solutions for large-scale fleet operations with complex requirements." features={[
            "Unlimited vehicles",
            "Unlimited charging stations",
            "Custom analytics solutions",
            "White-labeled mobile app",
            "24/7 dedicated support",
            "Custom integrations",
            "Advanced security features",
            "On-premise deployment option",
            "API access",
            "SLA guarantees"
        ]} buttonText="Contact Sales"/>
          </div>
        </div>
      </div>
      
      {/* Comparison Table */}
      <div className="py-16 px-6 bg-grid-blue">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Feature Comparison</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A detailed look at what's included in each plan to help you make the right choice.
            </p>
          </div>
          
          <div className="glass-effect rounded-xl overflow-hidden">
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-blue-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left font-semibold text-gray-800">Features</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-800">Starter</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-800">Professional</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-800">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
            { feature: "Vehicles Supported", starter: "Up to 25", professional: "Up to 100", enterprise: "Unlimited" },
            { feature: "Charging Stations", starter: "Up to 10", professional: "Up to 30", enterprise: "Unlimited" },
            { feature: "Real-time Monitoring", starter: "Basic", professional: "Advanced", enterprise: "Advanced" },
            { feature: "Route Optimization", starter: "Basic", professional: "AI-powered", enterprise: "Custom AI Solutions" },
            { feature: "Mobile Application", starter: "Basic App", professional: "Premium App", enterprise: "White-labeled App" },
            { feature: "Reporting", starter: "Monthly", professional: "Weekly", enterprise: "Custom" },
            { feature: "Analytics Dashboard", starter: "Basic", professional: "Advanced", enterprise: "Custom" },
            { feature: "API Access", starter: "Limited", professional: "Full Access", enterprise: "Enterprise Access" },
            { feature: "Integrations", starter: "Limited", professional: "Standard", enterprise: "Custom" },
            { feature: "Support", starter: "Standard", professional: "Priority", enterprise: "24/7 Dedicated" },
            { feature: "SLA", starter: "99% Uptime", professional: "99.5% Uptime", enterprise: "99.9% Uptime" },
            { feature: "Deployment Options", starter: "Cloud Only", professional: "Cloud Only", enterprise: "Cloud or On-Premise" },
            { feature: "Data Retention", starter: "6 Months", professional: "12 Months", enterprise: "Custom" },
            { feature: "Implementation Support", starter: "Self-service", professional: "Guided Setup", enterprise: "Full Implementation" },
        ].map(function (row, index) { return (<tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 border-b border-gray-200 font-medium">
                        <div className="flex items-center">
                          {row.feature}
                          <lucide_react_1.HelpCircle className="h-4 w-4 text-gray-400 ml-2 tooltip" data-tooltip={"Details about ".concat(row.feature)}/>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border-b border-gray-200">{row.starter}</td>
                      <td className="px-6 py-4 text-center border-b border-gray-200 bg-blue-50">{row.professional}</td>
                      <td className="px-6 py-4 text-center border-b border-gray-200">{row.enterprise}</td>
                    </tr>); })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Have questions about our pricing? Find answers to common questions below.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
            {
                question: "How do you define a 'vehicle' in your pricing structure?",
                answer: "A vehicle is any electric vehicle managed within our platform. This includes cars, vans, trucks, or any other electric fleet vehicle that uses our charging infrastructure and management system."
            },
            {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Yes, you can upgrade your plan at any time to accommodate growth. Downgrades can be processed at the end of your billing cycle. Our team will help ensure a smooth transition between plans."
            },
            {
                question: "Do you offer discounts for non-profits or government organizations?",
                answer: "Yes, we offer special pricing for non-profit organizations and government entities. Please contact our sales team for more information on our discount programs."
            },
            {
                question: "Is there a setup fee?",
                answer: "The Professional and Enterprise plans have no setup fees. The Starter plan has a one-time setup fee of $995 which includes basic onboarding and configuration assistance."
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, ACH transfers, and wire transfers. Enterprise customers can also arrange for invoicing with net-30 payment terms."
            },
            {
                question: "Is there a long-term contract?",
                answer: "Monthly plans can be canceled anytime. Annual plans require a 12-month commitment but offer significant savings. Enterprise plans typically have custom terms based on specific requirements."
            }
        ].map(function (faq, index) { return (<div key={index} className="card-premium p-6">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>); })}
          </div>
        </div>
      </div>
      
      {/* Contact Sales CTA */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Need a Custom Solution?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our team can create a tailored package that perfectly fits your fleet's unique requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-medium transition-all">
              Contact Sales
            </button>
            <button className="bg-transparent border border-white hover:bg-white/10 py-3 px-8 rounded-full font-medium transition-all">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>);
}
