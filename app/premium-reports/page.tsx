"use client";

import * as React from 'react';
import Link from 'next/link';
import { 
  Download as DownloadCloud, 
  ExternalLink as Share2, 
  Calendar, 
  Clock, 
  BarChart, 
  LineChart, 
  PieChart,
  FileText,
  Filter,
  ArrowRight as ArrowUpRight,
  Zap,
  Battery,
  TrendingUp,
  Car,
  Settings,
  Sparkles
} from 'lucide-react';

import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription, PremiumCardContent, PremiumCardFooter } from '../components/ui/premium-card';
import { PremiumButton } from '../components/ui/premium-button';
import { PremiumChart } from '../components/ui/premium-chart';
import { PremiumThemeSwitcher } from '../components/ui/premium-theme-switcher';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatNumber, formatPercentage, formatDate } from '../lib/utils';

// Sample data
const MONTHLY_REPORTS = [
  { id: 1, name: "April 2023 Energy Report", date: "2023-04-30", status: "complete", size: "4.2MB" },
  { id: 2, name: "March 2023 Energy Report", date: "2023-03-31", status: "complete", size: "3.8MB" },
  { id: 3, name: "February 2023 Energy Report", date: "2023-02-28", status: "complete", size: "3.5MB" },
  { id: 4, name: "January 2023 Energy Report", date: "2023-01-31", status: "complete", size: "4.0MB" },
];

const QUARTERLY_REPORTS = [
  { id: 1, name: "Q1 2023 Performance Review", date: "2023-04-15", status: "complete", size: "8.7MB" },
  { id: 2, name: "Q4 2022 Performance Review", date: "2023-01-15", status: "complete", size: "8.2MB" },
  { id: 3, name: "Q3 2022 Performance Review", date: "2022-10-15", status: "complete", size: "7.9MB" },
];

const ANNUAL_REPORTS = [
  { id: 1, name: "2022 Annual Energy Report", date: "2023-02-28", status: "complete", size: "12.4MB" },
  { id: 2, name: "2021 Annual Energy Report", date: "2022-02-28", status: "complete", size: "11.8MB" },
];

export default function PremiumReportsPage() {
  const [reportType, setReportType] = React.useState('monthly');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Get the appropriate report list based on selected type
  const reports = React.useMemo(() => {
    if (reportType === 'quarterly') return QUARTERLY_REPORTS;
    if (reportType === 'annual') return ANNUAL_REPORTS;
    return MONTHLY_REPORTS;
  }, [reportType]);
  
  const handleDownload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header with Premium Title and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
            Premium Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Enhanced reporting with premium visualizations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <PremiumThemeSwitcher showLabel={false} />
          
          <Tabs defaultValue="monthly" className="w-[300px]" onValueChange={setReportType}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumCard 
          variant="glass" 
          glow="subtle" 
          hover={true} 
          strokeHighlight={true}
          highlightColor="blue"
        >
          <PremiumCardHeader>
            <PremiumCardTitle>
              <FileText className="h-4 w-4 mr-2" />
              Available Reports
            </PremiumCardTitle>
            <PremiumCardDescription>
              All your generated reports
            </PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {MONTHLY_REPORTS.length + QUARTERLY_REPORTS.length + ANNUAL_REPORTS.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reports available for download
            </div>
          </PremiumCardContent>
          <PremiumCardFooter>
            <PremiumButton 
              variant="outline" 
              size="sm" 
              className="w-full"
              ripple={true}
            >
              View Archive
            </PremiumButton>
          </PremiumCardFooter>
        </PremiumCard>
        
        <PremiumCard 
          variant="glass" 
          glow="subtle" 
          hover={true} 
          strokeHighlight={true}
          highlightColor="purple"
        >
          <PremiumCardHeader>
            <PremiumCardTitle>
              <Clock className="h-4 w-4 mr-2" />
              Latest Report
            </PremiumCardTitle>
            <PremiumCardDescription>
              Most recently generated
            </PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="text-lg font-medium text-purple-600 dark:text-purple-400">
              {MONTHLY_REPORTS[0].name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Generated on {formatDate(new Date(MONTHLY_REPORTS[0].date))}
            </div>
          </PremiumCardContent>
          <PremiumCardFooter>
            <PremiumButton 
              variant="outline" 
              size="sm" 
              className="w-full"
              ripple={true}
              leftIcon={<DownloadCloud className="h-4 w-4" />}
              onClick={handleDownload}
            >
              {isLoading ? 'Downloading...' : 'Download Report'}
            </PremiumButton>
          </PremiumCardFooter>
        </PremiumCard>
        
        <PremiumCard 
          variant="glass" 
          glow="subtle" 
          hover={true} 
          strokeHighlight={true}
          highlightColor="green"
        >
          <PremiumCardHeader>
            <PremiumCardTitle>
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled Reports
            </PremiumCardTitle>
            <PremiumCardDescription>
              Upcoming report generation
            </PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              3
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Reports scheduled for next month
            </div>
          </PremiumCardContent>
          <PremiumCardFooter>
            <PremiumButton 
              variant="outline" 
              size="sm" 
              className="w-full"
              ripple={true}
            >
              Manage Schedule
            </PremiumButton>
          </PremiumCardFooter>
        </PremiumCard>
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2">
          <PremiumCard 
            variant="glass" 
            hover={true} 
            innerGlow={true}
            highlightColor="blue"
          >
            <PremiumCardHeader className="flex flex-row items-center justify-between">
              <div>
                <PremiumCardTitle>
                  {reportType === 'monthly' ? 'Monthly Reports' : 
                   reportType === 'quarterly' ? 'Quarterly Reports' : 'Annual Reports'}
                </PremiumCardTitle>
                <PremiumCardDescription>
                  {reports.length} reports available
                </PremiumCardDescription>
              </div>
              
              <PremiumButton 
                variant="outline" 
                size="sm"
                ripple={true}
                leftIcon={<Filter className="h-4 w-4" />}
              >
                Filter
              </PremiumButton>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {reports.map((report) => (
                  <div key={report.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(new Date(report.date))}
                          </span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        ripple={true}
                        leftIcon={<Share2 className="h-4 w-4" />}
                      >
                        <span className="hidden sm:inline">Share</span>
                      </PremiumButton>
                      <PremiumButton
                        variant="outline"
                        size="sm"
                        ripple={true}
                        leftIcon={<DownloadCloud className="h-4 w-4" />}
                      >
                        <span className="hidden sm:inline">Download</span>
                      </PremiumButton>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCardContent>
            <PremiumCardFooter className="border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {reports.length} of {reports.length} reports
                </span>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  ripple={true}
                >
                  View All Reports
                </PremiumButton>
              </div>
            </PremiumCardFooter>
          </PremiumCard>
        </div>
        
        {/* Report Preview */}
        <div className="space-y-6">
          <PremiumCard 
            variant="glass" 
            hover={true} 
            innerGlow={true}
            highlightColor="purple"
          >
            <PremiumCardHeader>
              <PremiumCardTitle>
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Report Preview
              </PremiumCardTitle>
              <PremiumCardDescription>
                Sample of report content
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-purple-200 dark:text-purple-900/20 mx-auto mb-3" />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Interactive report preview
                  </div>
                  <PremiumButton 
                    variant="gradient" 
                    className="mt-4"
                    ripple={true}
                  >
                    Load Preview
                  </PremiumButton>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Energy Usage</div>
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12.4%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Charging Sessions</div>
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +8.7%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Cost Efficiency</div>
                  <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5.2%
                  </div>
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
          
          <PremiumCard 
            variant="glass" 
            hover={true} 
            innerGlow={true}
            highlightColor="amber"
          >
            <PremiumCardHeader>
              <PremiumCardTitle>
                <Settings className="h-4 w-4 mr-2 text-amber-500" />
                Report Settings
              </PremiumCardTitle>
              <PremiumCardDescription>
                Customize your report generation
              </PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Auto-generation</div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="auto-generation" className="sr-only" defaultChecked />
                    <label htmlFor="auto-generation" className="toggle-bg block h-6 w-10 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Email notifications</div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="email-notifications" className="sr-only" defaultChecked />
                    <label htmlFor="email-notifications" className="toggle-bg block h-6 w-10 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"></label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Include raw data</div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="raw-data" className="sr-only" />
                    <label htmlFor="raw-data" className="toggle-bg block h-6 w-10 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </PremiumCardContent>
            <PremiumCardFooter>
              <PremiumButton
                variant="outline"
                size="sm"
                className="w-full"
                ripple={true}
              >
                Advanced Settings
              </PremiumButton>
            </PremiumCardFooter>
          </PremiumCard>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <PremiumButton 
          variant="gradient" 
          size="lg" 
          ripple={true} 
          glow="subtle"
          leftIcon={<Sparkles className="h-5 w-5" />}
        >
          Generate Custom Report
        </PremiumButton>
        
        <PremiumButton 
          variant="glass" 
          size="lg" 
          ripple={true}
          leftIcon={<Share2 className="h-5 w-5" />}
        >
          Share Report Collection
        </PremiumButton>
      </div>
      
      {/* Navigation links */}
      <div className="flex justify-center mt-8 space-x-6">
        <Link href="/premium-analytics" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
          Premium Analytics
        </Link>
        <Link href="/analytics" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
          Standard Analytics
        </Link>
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
          Dashboard
        </Link>
      </div>
      
      {/* Custom toggle styling */}
      <style>{`
        .toggle-bg:after {
          content: '';
          @apply absolute left-0.5 top-0.5 bg-white dark:bg-gray-300 rounded-full h-5 w-5 transition-transform;
        }
        
        input:checked + .toggle-bg:after {
          transform: translateX(100%);
        }
        
        input:checked + .toggle-bg {
          @apply bg-blue-600 dark:bg-blue-500;
        }
      `}</style>
    </div>
  );
} 