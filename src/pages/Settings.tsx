import React, { useState } from 'react';
import { Building, Sliders, Bell, Users, Database, Save, Activity } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('policy');

  const tabs = [
    { id: 'company', label: 'Company', icon: Building },
    { id: 'policy', label: 'Leave Policy', icon: Sliders },
    { id: 'behavior', label: 'Behavior Scoring', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'data', label: 'Data & Backup', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main">System Settings</h1>
          <p className="text-sm text-text-muted">Configure HR policies, scoring weights, and system preferences</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="bg-bg-card rounded-xl border border-border-subtle flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-bg-deep border-r border-border-subtle p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-bg-card text-indigo-400'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text-main'
                }`}
              >
                <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-indigo-400' : 'text-text-muted'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'policy' && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-text-main mb-4">Base Entitlements</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-text-main">Junior Level (Days)</label>
                    <input type="number" defaultValue={14} className="col-span-2 p-2 bg-bg-deep border border-border-subtle text-text-main rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-text-main">Senior Level (Days)</label>
                    <input type="number" defaultValue={18} className="col-span-2 p-2 bg-bg-deep border border-border-subtle text-text-main rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-text-main">Manager Level (Days)</label>
                    <input type="number" defaultValue={21} className="col-span-2 p-2 bg-bg-deep border border-border-subtle text-text-main rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-text-main">Standard MC (Days)</label>
                    <input type="number" defaultValue={14} className="col-span-2 p-2 bg-bg-deep border border-border-subtle text-text-main rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              </div>

              <hr className="border-border-subtle" />

              <div>
                <h2 className="text-lg font-semibold text-text-main mb-4">Leave Rules</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-text-main">Allow Carry Forward</h4>
                      <p className="text-sm text-text-muted">Allow employees to carry forward unused annual leave</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-bg-deep border border-border-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-main after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-text-main">Max Carry Forward (Days)</label>
                    <input type="number" defaultValue={5} className="col-span-2 p-2 bg-bg-deep border border-border-subtle text-text-main rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-sm font-medium text-text-main">Carry Forward Expiry (Months)</label>
                    <input type="number" defaultValue={3} className="col-span-2 p-2 bg-bg-deep border border-border-subtle text-text-main rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'policy' && (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <Sliders className="w-12 h-12 mb-4 text-border-subtle" />
              <p>Configuration options for {tabs.find(t => t.id === activeTab)?.label} will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
