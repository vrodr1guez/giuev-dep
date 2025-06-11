"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, Download, FileText, Users, 
  Clock, Calendar, Filter, ChevronDown, ArrowRight,
  CheckCircle, AlertCircle, Search, PieChart, BarChart,
  TrendingUp, TrendingDown, ExternalLink, Zap, Loader2,
  RefreshCw, AlertTriangle, Plus, Eye
} from 'lucide-react';

// Types for API responses
interface BillingSummary {
  label: string;
  value: string;
  change?: string;
  previous_value?: string;
  due_date?: string;
}

interface InvoiceItem {
  description: string;
  amount: number;
  quantity?: number;
  unit?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
  payment_method: string;
  payment_date?: string;
  items: InvoiceItem[];
  customer: string;
  due_date: string;
}

interface ReimbursementRequest {
  id: string;
  employee: string;
  employee_id: string;
  department: string;
  date: string;
  amount: string;
  status: string;
  approved_by?: string;
  approved_date?: string;
  description: string;
  location: string;
  vehicle: string;
}

interface UsageStats {
  total_consumption: string;
  estimated_cost: string;
  active_locations: number;
  peak_demand: string;
  off_peak_percentage: string;
  cost_savings: string;
}

interface PaymentBreakdown {
  total_paid: string;
  by_location: Array<{name: string; amount: string; percentage: number}>;
  by_time_of_use: Array<{name: string; amount: string; percentage: number}>;
}

export default function BillingPaymentPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API Data states
  const [billingSummary, setBillingSummary] = useState<BillingSummary[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reimbursements, setReimbursements] = useState<ReimbursementRequest[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown | null>(null);

  // API Base URL
  const API_BASE = 'http://localhost:8000/api/v1';

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [summaryRes, invoicesRes, reimbursementsRes, usageRes, breakdownRes] = await Promise.allSettled([
        fetch(`${API_BASE}/billing/summary`),
        fetch(`${API_BASE}/billing/invoices?timeframe=${selectedTimeframe}${statusFilter ? `&status=${statusFilter}` : ''}`),
        fetch(`${API_BASE}/billing/reimbursements`),
        fetch(`${API_BASE}/billing/usage/current-month`),
        fetch(`${API_BASE}/billing/payment-breakdown`)
      ]);

      // Handle billing summary
      if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
        const summaryData = await summaryRes.value.json();
        setBillingSummary(summaryData);
      } else {
        // Fallback to mock data
        setBillingSummary([
          { label: "Monthly Average", value: "$1,256.32", change: "+3.2%", previous_value: "$1,217.36" },
          { label: "YTD Total", value: "$6,245.89", change: "-5.1%", previous_value: "$6,581.12 (same period last year)" },
          { label: "Cost per kWh", value: "$0.142", change: "-8.3%", previous_value: "$0.155" },
          { label: "Pending Invoices", value: "$1,123.56", due_date: "Due in 10 days" }
        ]);
      }

      // Handle invoices
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.ok) {
        const invoicesData = await invoicesRes.value.json();
        setInvoices(invoicesData);
      } else {
        // Fallback to mock data
        setInvoices([
          {
            id: 'INV-2024-1205',
            date: '2024-05-15',
            amount: '$1,245.78',
            status: 'Paid',
            payment_method: 'Corporate Card (Visa •••• 3845)',
            payment_date: '2024-05-16',
            items: [
              { description: 'HQ Charging Hub - 5,430 kWh', amount: 762.65 },
              { description: 'Downtown Depot - 2,824 kWh', amount: 396.95 },
              { description: 'West Distribution Center - 613 kWh', amount: 86.18 }
            ],
            customer: 'GreenFleet Corp',
            due_date: '2024-05-30'
          },
          {
            id: 'INV-2024-1238',
            date: '2024-05-30',
            amount: '$1,123.56',
            status: 'Pending',
            payment_method: 'Pending',
            items: [
              { description: 'HQ Charging Hub - 4,876 kWh', amount: 685.68 },
              { description: 'Downtown Depot - 2,365 kWh', amount: 332.68 },
              { description: 'West Distribution Center - 748 kWh', amount: 105.20 }
            ],
            customer: 'GreenFleet Corp',
            due_date: '2024-06-14'
          }
        ]);
      }

      // Handle reimbursements
      if (reimbursementsRes.status === 'fulfilled' && reimbursementsRes.value.ok) {
        const reimbursementsData = await reimbursementsRes.value.json();
        setReimbursements(reimbursementsData);
      } else {
        // Fallback to mock data
        setReimbursements([
          {
            id: 'REIMB-2024-048',
            employee: 'John Smith',
            employee_id: 'EMP-234',
            department: 'Delivery Operations',
            date: '2024-05-20',
            amount: '$37.50',
            status: 'Approved',
            approved_by: 'Sarah Johnson',
            approved_date: '2024-05-22',
            description: 'Charging at third-party station during client visit',
            location: 'ElectroCharge, 456 Main St, Bellevue, WA',
            vehicle: 'Tesla Model Y (Fleet #723)'
          }
        ]);
      }

      // Handle usage stats
      if (usageRes.status === 'fulfilled' && usageRes.value.ok) {
        const usageData = await usageRes.value.json();
        setUsageStats(usageData);
      } else {
        // Fallback to mock data
        setUsageStats({
          total_consumption: "13,120 kWh",
          estimated_cost: "$1,862.56",
          active_locations: 3,
          peak_demand: "124 kW",
          off_peak_percentage: "68%",
          cost_savings: "$214.38 (through off-peak charging)"
        });
      }

      // Handle payment breakdown
      if (breakdownRes.status === 'fulfilled' && breakdownRes.value.ok) {
        const breakdownData = await breakdownRes.value.json();
        setPaymentBreakdown(breakdownData);
      } else {
        // Fallback to mock data
        setPaymentBreakdown({
          total_paid: "$3,579.15",
          by_location: [
            { name: "HQ Charging Hub", amount: "$2,180.99", percentage: 61 },
            { name: "Downtown Depot", amount: "$1,089.93", percentage: 30 },
            { name: "West Distribution Center", amount: "$308.23", percentage: 9 }
          ],
          by_time_of_use: [
            { name: "Off-Peak (9PM-6AM)", amount: "$1,396.87", percentage: 39 },
            { name: "Mid-Peak (6AM-12PM, 7PM-9PM)", amount: "$1,218.91", percentage: 34 },
            { name: "Peak (12PM-7PM)", amount: "$963.37", percentage: 27 }
          ]
        });
      }

    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing data. Using cached data.');
      // Use fallback data
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [selectedTimeframe, statusFilter]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading component
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Billing Data</h2>
            <p className="text-gray-500">Please wait while we fetch your billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Payment</h1>
          <p className="text-gray-600">Manage invoices, payments, and reimbursements</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/ev-management/billing/settings"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Payment Settings</span>
          </Link>
          <Link
            href="/ev-management/billing/new-invoice"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Generate Invoice</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {billingSummary.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
              {index === 0 && <DollarSign className="h-5 w-5 text-blue-500" />}
              {index === 1 && <FileText className="h-5 w-5 text-indigo-500" />}
              {index === 2 && <Zap className="h-5 w-5 text-amber-500" />}
              {index === 3 && <Clock className="h-5 w-5 text-red-500" />}
            </div>
            <p className="text-3xl font-bold">{item.value}</p>
            {item.change && (
              <p className={`text-sm mt-2 flex items-center ${
                item.change.startsWith('+') ? 'text-red-600' : 'text-green-600'
              }`}>
                {item.change.startsWith('+') ? 
                  <TrendingUp className="h-4 w-4 mr-1" /> : 
                  <TrendingDown className="h-4 w-4 mr-1" />
                }
                {item.change} {item.previous_value && `vs ${item.previous_value}`}
              </p>
            )}
            {item.due_date && (
              <p className="text-sm mt-2 text-red-600 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {item.due_date}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Current Billing Period Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Current Month Usage</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>May 1 - May 31, 2024</span>
            </div>
          </div>
          
          {usageStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Total Consumption</p>
                <p className="text-xl font-bold text-blue-600">{usageStats.total_consumption}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                <p className="text-xl font-bold text-green-600">{usageStats.estimated_cost}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Active Locations</p>
                <p className="text-xl font-bold text-purple-600">{usageStats.active_locations}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Peak Demand</p>
                <p className="text-xl font-bold text-orange-600">{usageStats.peak_demand}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Off-Peak Usage</p>
                <p className="text-xl font-bold text-teal-600">{usageStats.off_peak_percentage}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Cost Savings</p>
                <p className="text-xl font-bold text-emerald-600">{usageStats.cost_savings}</p>
              </div>
            </div>
          )}
          
          {/* Interactive Chart */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-60 rounded-lg flex items-center justify-center border border-blue-100 relative overflow-hidden">
            <div className="absolute inset-0 p-8">
              <div className="h-full w-full flex items-end justify-between">
                {[30, 45, 60, 80, 70, 55, 40, 50, 65, 75, 40, 30].map((height, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md shadow-sm hover:from-blue-600 hover:to-blue-500 transition-all duration-300 cursor-pointer"
                    style={{ height: `${height}%`, width: '6%' }}
                    title={`Day ${index + 1}: ${height * 2} kWh`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="text-center z-10">
              <BarChart className="h-16 w-16 text-blue-300 mb-2" />
              <p className="text-blue-600 font-medium">Daily Usage Trend</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6">Payment Breakdown</h2>
          
          {paymentBreakdown && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Total Paid (Last 30 Days)</p>
              <p className="text-2xl font-bold mb-4 text-green-600">{paymentBreakdown.total_paid}</p>
              
              <h3 className="text-md font-semibold mb-3 text-gray-700">By Location</h3>
              <div className="space-y-3 mb-6">
                {paymentBreakdown.by_location.map((location, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-gray-600">{location.amount} ({location.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700" 
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-md font-semibold mb-3 text-gray-700">By Time of Use</h3>
              <div className="space-y-3">
                {paymentBreakdown.by_time_of_use.map((timeSlot, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{timeSlot.name}</span>
                      <span className="text-gray-600">{timeSlot.amount} ({timeSlot.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gradient-to-r from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700' :
                          index === 1 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 group-hover:from-yellow-600 group-hover:to-yellow-700' : 
                          'bg-gradient-to-r from-red-500 to-red-600 group-hover:from-red-600 group-hover:to-red-700'
                        }`}
                        style={{ width: `${timeSlot.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Link 
            href="/ev-management/billing/reports" 
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center font-medium hover:underline"
          >
            View Detailed Reports
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Recent Invoices</h2>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 px-4 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute right-3 top-2.5">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <select 
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <select 
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Link 
              href="/ev-management/billing/invoices" 
              className="text-blue-600 hover:text-blue-800 flex items-center font-medium hover:underline"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="font-medium text-gray-900">{invoice.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {invoice.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status === 'Paid' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate">
                    {invoice.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.due_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/ev-management/billing/invoices/${invoice.id}`} 
                      className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    <Link 
                      href={`/ev-management/billing/invoices/${invoice.id}/download`} 
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Reimbursement Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Reimbursement Requests</h2>
          <div className="flex gap-3">
            <Link 
              href="/ev-management/billing/reimbursements/new"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Link>
            <Link 
              href="/ev-management/billing/reimbursements" 
              className="text-blue-600 hover:text-blue-800 flex items-center font-medium hover:underline"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reimbursements.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {request.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.employee}</div>
                    <div className="text-xs text-gray-500">{request.employee_id} • {request.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {request.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[250px] truncate">
                    {request.description} - {request.vehicle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/ev-management/billing/reimbursements/${request.id}`} 
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {reimbursements.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reimbursement requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 