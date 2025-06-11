"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DriverMobileView_1 = require("../../components/mobile/DriverMobileView");
var DriverMobileAppPage = function () {
    return (<div className="container mx-auto py-6">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Driver Mobile Application</h1>
        <p className="text-gray-500 mb-8 max-w-2xl text-center">
          This is a preview of the mobile application interface for drivers. The mobile app
          provides drivers with essential information and tools on the go, including route details,
          vehicle status, and charging information.
        </p>
        
        <div className="flex justify-center p-6 bg-gray-100 rounded-xl">
          <div className="relative">
            {/* Mobile device frame */}
            <div className="absolute -inset-4 bg-gray-800 rounded-[32px] shadow-xl -z-10"></div>
            
            {/* Status bar */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10"></div>
            
            {/* Mobile view component */}
            <DriverMobileView_1.default />
          </div>
        </div>
        
        <div className="mt-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">About the Driver Mobile Application</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-lg mb-2">Features</h3>
              <ul className="ml-5 list-disc space-y-1 text-gray-600">
                <li>Real-time route and task information</li>
                <li>Integration with preferred navigation apps</li>
                <li>Vehicle status monitoring with battery information</li>
                <li>Nearby charging station finder</li>
                <li>Pre-trip and post-trip checklists</li>
                <li>Driver performance scorecard</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-lg mb-2">Benefits</h3>
              <ul className="ml-5 list-disc space-y-1 text-gray-600">
                <li>Improved route efficiency and navigation</li>
                <li>Better management of vehicle charging</li>
                <li>Enhanced compliance with safety procedures</li>
                <li>Real-time feedback on driving performance</li>
                <li>Simplified communication with dispatch</li>
                <li>Increased driver confidence with EV operations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = DriverMobileAppPage;
