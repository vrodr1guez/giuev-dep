"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContactPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function ContactPage() {
    return (<div className="min-h-screen bg-dots-indigo">
      {/* Hero Section */}
      <div className="bg-white pt-20 pb-24 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-10">
              Have questions about our EV charging infrastructure solutions? Our team is ready to help.
            </p>
          </div>
        </div>
      </div>
      
      {/* Contact Form and Info */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card-premium p-8 card-3d">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input type="text" id="firstName" name="firstName" className="w-full input-field" placeholder="Enter your first name"/>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input type="text" id="lastName" name="lastName" className="w-full input-field" placeholder="Enter your last name"/>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input type="email" id="email" name="email" className="w-full input-field" placeholder="Enter your email address"/>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input type="tel" id="phone" name="phone" className="w-full input-field" placeholder="Enter your phone number"/>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input type="text" id="company" name="company" className="w-full input-field" placeholder="Enter your company name"/>
                </div>
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Contact
                  </label>
                  <select id="reason" name="reason" className="w-full input-field">
                    <option value="">Select a reason</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="demo">Request a Demo</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea id="message" name="message" rows={5} className="w-full input-field" placeholder="Enter your message"></textarea>
                </div>
                
                <div className="flex items-start">
                  <input type="checkbox" id="consent" name="consent" className="mt-1 mr-2"/>
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I consent to having this website store my submitted information so they can respond to my inquiry.
                  </label>
                </div>
                
                <div>
                  <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center">
                    Send Message
                    <lucide_react_1.Send className="ml-2 h-4 w-4"/>
                  </button>
                </div>
              </form>
            </div>
            
            {/* Contact Information */}
            <div>
              <div className="glass-effect p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-full mr-4">
                      <lucide_react_1.MapPin className="h-5 w-5 text-blue-600"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Headquarters</h3>
                      <p className="text-gray-600">
                        123 Tech Drive, Suite 400<br />
                        San Francisco, CA 94107<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-full mr-4">
                      <lucide_react_1.Mail className="h-5 w-5 text-green-600"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">
                        Sales: sales@giutech.com<br />
                        Support: support@giutech.com<br />
                        General: info@giutech.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-2 bg-amber-100 rounded-full mr-4">
                      <lucide_react_1.Phone className="h-5 w-5 text-amber-600"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">
                        Toll-Free: (800) 123-4567<br />
                        International: +1 (415) 555-1234<br />
                        Support: (888) 987-6543
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-full mr-4">
                      <lucide_react_1.Clock className="h-5 w-5 text-purple-600"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 8:00 AM - 6:00 PM PST<br />
                        Saturday: 9:00 AM - 2:00 PM PST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-effect p-8">
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-full mr-4">
                      <lucide_react_1.MessageSquare className="h-5 w-5 text-red-600"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Live Chat</h3>
                      <p className="text-gray-600">
                        Available 24/7 for urgent inquiries
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Need Immediate Assistance?</h3>
                    <p className="text-gray-600 mb-4">
                      Our team is available for urgent technical support issues.
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center text-sm">
                      Start Live Chat
                      <lucide_react_1.MessageSquare className="ml-2 h-4 w-4"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map */}
      <div className="py-16 px-6 bg-grid-blue">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Global Locations</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We have offices and partner facilities around the world to serve you better.
            </p>
          </div>
          
          <div className="card-premium rounded-xl overflow-hidden h-96 relative">
            {/* This would normally be a real map integration */}
            <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
              <p className="text-lg text-blue-500">Interactive map would be displayed here</p>
            </div>
            
            {/* Sample location markers */}
            <div className="absolute w-4 h-4 bg-blue-600 rounded-full left-[20%] top-[30%] animate-ping"></div>
            <div className="absolute w-4 h-4 bg-blue-600 rounded-full left-[30%] top-[35%] animate-ping" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute w-4 h-4 bg-blue-600 rounded-full left-[45%] top-[25%] animate-ping" style={{ animationDelay: "1s" }}></div>
            <div className="absolute w-4 h-4 bg-blue-600 rounded-full left-[75%] top-[40%] animate-ping" style={{ animationDelay: "1.5s" }}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">North America</h3>
              <p className="text-gray-600 text-sm">
                San Francisco (HQ)<br />
                New York<br />
                Chicago<br />
                Toronto
              </p>
            </div>
            
            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">Europe</h3>
              <p className="text-gray-600 text-sm">
                London<br />
                Berlin<br />
                Amsterdam<br />
                Paris
              </p>
            </div>
            
            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">Asia Pacific</h3>
              <p className="text-gray-600 text-sm">
                Singapore<br />
                Tokyo<br />
                Sydney<br />
                Hong Kong
              </p>
            </div>
            
            <div className="card-premium p-6">
              <h3 className="font-semibold mb-2">Partner Network</h3>
              <p className="text-gray-600 text-sm">
                50+ certified partners<br />
                250+ service locations<br />
                24/7 global support<br />
                Local expertise
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ */}
      <div className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about contacting us.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
            {
                question: "What is the typical response time for inquiries?",
                answer: "We aim to respond to all inquiries within 24 business hours. For urgent technical support issues, please use our live chat feature for immediate assistance."
            },
            {
                question: "How can I schedule a product demonstration?",
                answer: "You can request a product demonstration by filling out the contact form above and selecting 'Request a Demo' from the dropdown menu. Our sales team will reach out to schedule a personalized demonstration."
            },
            {
                question: "Do you offer on-site consultations?",
                answer: "Yes, we offer on-site consultations for enterprise clients. Please contact our sales team to arrange an on-site visit to discuss your specific requirements and solutions."
            },
            {
                question: "How can I reach your technical support team?",
                answer: "Technical support is available via email at support@giutech.com, by phone at (888) 987-6543, or through our 24/7 live chat feature for urgent issues."
            }
        ].map(function (faq, index) { return (<div key={index} className="card-premium p-6">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>); })}
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Fleet?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us today to discuss how our EV charging infrastructure solutions can help you achieve your sustainability and operational goals.
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
