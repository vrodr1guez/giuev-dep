"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CreditCard, Settings, Bell, Calculator, 
  FileText, Zap, Clock, Save, Plus, Edit3, Trash2,
  CheckCircle, AlertCircle, Shield, DollarSign,
  Mail, Smartphone, Globe, Download, Upload,
  Eye, EyeOff, ToggleLeft, ToggleRight
} from 'lucide-react';

// Types
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'digital';
  name: string;
  details: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
  isActive: boolean;
}

interface BillingSettings {
  currency: string;
  timezone: string;
  language: string;
  invoiceFrequency: string;
  paymentTerms: number;
  autoPayment: boolean;
  paperlessInvoicing: boolean;
  consolidatedBilling: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  invoiceGenerated: boolean;
  paymentDue: boolean;
  paymentProcessed: boolean;
  paymentFailed: boolean;
  creditLimitWarning: boolean;
}

interface TaxSettings {
  taxId: string;
  taxExempt: boolean;
  taxRate: number;
  includeTaxInPrice: boolean;
  taxReportingEnabled: boolean;
}

export default function BillingSettingsPage() {
  const [activeTab, setActiveTab] = useState('payment-methods');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Corporate Visa',
      details: 'Visa •••• 3845',
      last4: '3845',
      expiry: '11/25',
      isDefault: true,
      isActive: true
    },
    {
      id: '2',
      type: 'bank',
      name: 'Business Checking',
      details: 'First National Bank •••6712',
      last4: '6712',
      isDefault: false,
      isActive: true
    }
  ]);

  // Billing Settings
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    language: 'en',
    invoiceFrequency: 'monthly',
    paymentTerms: 30,
    autoPayment: true,
    paperlessInvoicing: true,
    consolidatedBilling: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    invoiceGenerated: true,
    paymentDue: true,
    paymentProcessed: true,
    paymentFailed: true,
    creditLimitWarning: true
  });

  // Tax Settings
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    taxId: 'US-123456789',
    taxExempt: false,
    taxRate: 8.25,
    includeTaxInPrice: false,
    taxReportingEnabled: true
  });

  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);

  // Save settings
  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Tab components
  const tabs = [
    { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
    { id: 'billing-settings', label: 'Billing Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tax-settings', label: 'Tax Settings', icon: Calculator }
  ];

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-600">Manage your payment methods and billing preferences</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </button>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  method.type === 'card' ? 'bg-blue-100 text-blue-600' :
                  method.type === 'bank' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {method.type === 'card' ? <CreditCard className="h-5 w-5" /> : 
                   method.type === 'bank' ? <DollarSign className="h-5 w-5" /> :
                   <Smartphone className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{method.details}</p>
                  {method.expiry && (
                    <p className="text-xs text-gray-400">Expires {method.expiry}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCardDetails(showCardDetails === method.id ? null : method.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCardDetails === method.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
                {!method.isDefault && (
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {showCardDetails === method.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 ${method.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Used:</span>
                    <span className="ml-2 text-gray-700">2 days ago</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Added:</span>
                    <span className="ml-2 text-gray-700">March 15, 2024</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Transactions:</span>
                    <span className="ml-2 text-gray-700">47 successful</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Security Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              All payment information is encrypted and stored securely. We use industry-standard PCI DSS compliance 
              to protect your financial data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Billing Settings</h3>
        <p className="text-sm text-gray-600">Configure your billing preferences and invoice settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select 
              value={billingSettings.currency}
              onChange={(e) => setBillingSettings({...billingSettings, currency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select 
              value={billingSettings.timezone}
              onChange={(e) => setBillingSettings({...billingSettings, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Frequency</label>
            <select 
              value={billingSettings.invoiceFrequency}
              onChange={(e) => setBillingSettings({...billingSettings, invoiceFrequency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (Days)</label>
            <input
              type="number"
              value={billingSettings.paymentTerms}
              onChange={(e) => setBillingSettings({...billingSettings, paymentTerms: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max="90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select 
              value={billingSettings.language}
              onChange={(e) => setBillingSettings({...billingSettings, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Automation Settings</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Auto Payment</h5>
              <p className="text-sm text-gray-600">Automatically pay invoices when due</p>
            </div>
            <button
              onClick={() => setBillingSettings({...billingSettings, autoPayment: !billingSettings.autoPayment})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingSettings.autoPayment ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingSettings.autoPayment ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Paperless Invoicing</h5>
              <p className="text-sm text-gray-600">Receive invoices electronically only</p>
            </div>
            <button
              onClick={() => setBillingSettings({...billingSettings, paperlessInvoicing: !billingSettings.paperlessInvoicing})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingSettings.paperlessInvoicing ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingSettings.paperlessInvoicing ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Consolidated Billing</h5>
              <p className="text-sm text-gray-600">Combine multiple locations into one invoice</p>
            </div>
            <button
              onClick={() => setBillingSettings({...billingSettings, consolidatedBilling: !billingSettings.consolidatedBilling})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingSettings.consolidatedBilling ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingSettings.consolidatedBilling ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        <p className="text-sm text-gray-600">Choose how you want to receive billing notifications</p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Delivery Methods</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Email</span>
            </div>
            <button
              onClick={() => setNotificationSettings({...notificationSettings, email: !notificationSettings.email})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.email ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.email ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">SMS</span>
            </div>
            <button
              onClick={() => setNotificationSettings({...notificationSettings, sms: !notificationSettings.sms})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.sms ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.sms ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Push</span>
            </div>
            <button
              onClick={() => setNotificationSettings({...notificationSettings, push: !notificationSettings.push})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.push ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.push ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Event Notifications</h4>
        
        <div className="space-y-3">
          {[
            { key: 'invoiceGenerated', label: 'Invoice Generated', desc: 'When a new invoice is created' },
            { key: 'paymentDue', label: 'Payment Due', desc: 'Reminder before payment is due' },
            { key: 'paymentProcessed', label: 'Payment Processed', desc: 'When payment is successfully processed' },
            { key: 'paymentFailed', label: 'Payment Failed', desc: 'When payment processing fails' },
            { key: 'creditLimitWarning', label: 'Credit Limit Warning', desc: 'When approaching credit limit' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">{notification.label}</h5>
                <p className="text-sm text-gray-600">{notification.desc}</p>
              </div>
              <button
                onClick={() => setNotificationSettings({
                  ...notificationSettings, 
                  [notification.key]: !notificationSettings[notification.key as keyof NotificationSettings]
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[notification.key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings[notification.key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Tax Settings</h3>
        <p className="text-sm text-gray-600">Configure tax information and reporting preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT Number</label>
            <input
              type="text"
              value={taxSettings.taxId}
              onChange={(e) => setTaxSettings({...taxSettings, taxId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your tax ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={taxSettings.taxRate}
              onChange={(e) => setTaxSettings({...taxSettings, taxRate: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Tax Exempt</h5>
              <p className="text-sm text-gray-600">Organization is exempt from taxes</p>
            </div>
            <button
              onClick={() => setTaxSettings({...taxSettings, taxExempt: !taxSettings.taxExempt})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                taxSettings.taxExempt ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                taxSettings.taxExempt ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Include Tax in Price</h5>
              <p className="text-sm text-gray-600">Show prices including tax</p>
            </div>
            <button
              onClick={() => setTaxSettings({...taxSettings, includeTaxInPrice: !taxSettings.includeTaxInPrice})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                taxSettings.includeTaxInPrice ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                taxSettings.includeTaxInPrice ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Tax Reporting</h5>
              <p className="text-sm text-gray-600">Generate tax reports automatically</p>
            </div>
            <button
              onClick={() => setTaxSettings({...taxSettings, taxReportingEnabled: !taxSettings.taxReportingEnabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                taxSettings.taxReportingEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                taxSettings.taxReportingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Tax Documents</h4>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download Tax Summary
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Upload Tax Certificate
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            View Tax Reports
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Link 
          href="/ev-management/billing"
          className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing Settings</h1>
          <p className="text-gray-600">Configure your billing preferences and payment methods</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        {activeTab === 'payment-methods' && renderPaymentMethods()}
        {activeTab === 'billing-settings' && renderBillingSettings()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'tax-settings' && renderTaxSettings()}
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {saveStatus === 'saved' && (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">Settings saved successfully</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-600 font-medium">Failed to save settings</span>
            </>
          )}
        </div>

        <div className="flex space-x-3">
          <Link
            href="/ev-management/billing"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 