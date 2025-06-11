"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var card_1 = require("../../components/ui/card");
var tabs_1 = require("../../components/ui/tabs");
var lucide_react_1 = require("lucide-react");
// Import our custom components
// Note: In a real implementation, you would ensure these paths are correct
var ReportBuilder_1 = require("../../components/analytics/ReportBuilder");
var ReportsPage = function () {
    // Define available report types
    var reportTypes = [
        {
            id: 'fleet-performance',
            title: 'Fleet Performance',
            description: 'Comprehensive fleet performance metrics and KPIs',
            icon: <lucide_react_1.LineChart className="h-10 w-10 text-blue-500"/>,
            path: '/reports/fleet-performance'
        },
        {
            id: 'energy-usage',
            title: 'Energy Usage',
            description: 'Detailed energy consumption and charging patterns',
            icon: <lucide_react_1.BarChart className="h-10 w-10 text-green-500"/>,
            path: '/reports/energy-usage'
        },
        {
            id: 'driver-behavior',
            title: 'Driver Behavior',
            description: 'Driver performance and behavior analysis',
            icon: <lucide_react_1.PieChart className="h-10 w-10 text-purple-500"/>,
            path: '/reports/driver-behavior'
        },
        {
            id: 'custom-reports',
            title: 'Custom Reports',
            description: 'Build your own reports with our custom report builder',
            icon: <lucide_react_1.FileText className="h-10 w-10 text-gray-500"/>,
            path: '/reports/custom'
        }
    ];
    // Recent reports list (mock data)
    var recentReports = [
        {
            id: 'rep-1',
            title: 'Monthly Fleet Efficiency',
            type: 'Energy Usage',
            date: '2024-05-10',
            metrics: ['Energy Consumed', 'Cost per Mile', 'CO₂ Saved'],
            downloadUrl: '#'
        },
        {
            id: 'rep-2',
            title: 'Driver Performance Q2',
            type: 'Driver Behavior',
            date: '2024-05-08',
            metrics: ['Efficiency Score', 'Idle Time', 'Harsh Braking'],
            downloadUrl: '#'
        },
        {
            id: 'rep-3',
            title: 'Battery Health Analysis',
            type: 'Fleet Performance',
            date: '2024-05-05',
            metrics: ['SoH Distribution', 'Degradation Rate', 'Replacement Forecast'],
            downloadUrl: '#'
        }
    ];
    // Format date
    var formatDate = function (dateString) {
        var date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };
    return (<div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Analyze fleet data with customizable reports and visualizations</p>
      </div>

      <tabs_1.Tabs defaultValue="reports">
        <tabs_1.TabsList className="w-full max-w-md mb-6">
          <tabs_1.TabsTrigger value="reports" className="flex-1">Standard Reports</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="custom" className="flex-1">Custom Report Builder</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map(function (report) { return (<a key={report.id} href={report.path} className="block hover:shadow-md transition-shadow">
                <card_1.Card>
                  <card_1.CardContent className="pt-6">
                    <div className="flex items-center justify-center mb-4">
                      {report.icon}
                    </div>
                    <h3 className="text-xl font-medium text-center">{report.title}</h3>
                    <p className="mt-2 text-gray-600 text-center text-sm">{report.description}</p>
                  </card_1.CardContent>
                </card_1.Card>
              </a>); })}
          </div>

          <card_1.Card className="mt-8">
            <card_1.CardHeader>
              <card_1.CardTitle>Recent Reports</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-3 font-medium">Report Name</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Date Generated</th>
                      <th className="p-3 font-medium">Metrics</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentReports.map(function (report) { return (<tr key={report.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{report.title}</td>
                        <td className="p-3">{report.type}</td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <lucide_react_1.Calendar className="h-4 w-4 text-gray-400 mr-2"/>
                            {formatDate(report.date)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {report.metrics.map(function (metric, index) { return (<span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {metric}
                              </span>); })}
                          </div>
                        </td>
                        <td className="p-3">
                          <a href={report.downloadUrl} className="flex items-center text-blue-600 hover:text-blue-800">
                            <lucide_react_1.Download className="h-4 w-4 mr-1"/>
                            <span>Download</span>
                          </a>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="custom">
          <ReportBuilder_1.default />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
};
exports.default = ReportsPage;
