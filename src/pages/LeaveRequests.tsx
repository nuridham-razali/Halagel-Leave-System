import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter, Plus } from 'lucide-react';

export default function LeaveRequests() {
  const [activeTab, setActiveTab] = useState('pending');

  const requests = [
    { id: 'REQ001', name: 'John Doe', type: 'Annual Leave', startDate: '2023-10-15', endDate: '2023-10-18', days: 4, status: 'pending', appliedOn: '2023-10-01', reason: 'Family vacation' },
    { id: 'REQ002', name: 'Jane Smith', type: 'MC', startDate: '2023-10-05', endDate: '2023-10-06', days: 2, status: 'approved', appliedOn: '2023-10-05', reason: 'Fever and flu' },
    { id: 'REQ003', name: 'Mike Johnson', type: 'Emergency', startDate: '2023-09-20', endDate: '2023-09-20', days: 1, status: 'rejected', appliedOn: '2023-09-19', reason: 'Personal matters' },
    { id: 'REQ004', name: 'Sarah Williams', type: 'Unpaid Leave', startDate: '2023-11-01', endDate: '2023-11-05', days: 5, status: 'pending', appliedOn: '2023-10-02', reason: 'Extended travel' },
  ];

  const filteredRequests = activeTab === 'all' 
    ? requests 
    : requests.filter(req => req.status === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      case 'approved': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case 'rejected': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MC': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'Annual Leave': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Unpaid Leave': return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
      case 'Emergency': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Compassionate': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      default: return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-main">Leave Requests</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      <div className="bg-bg-card rounded-xl border border-border-subtle overflow-hidden">
        <div className="border-b border-border-subtle px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-4">
            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-text-muted hover:text-text-main hover:border-border-subtle'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 bg-bg-deep text-text-muted py-0.5 px-2 rounded-full text-xs border border-border-subtle">
                  {tab === 'all' ? requests.length : requests.filter(r => r.status === tab).length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-text-muted hover:text-text-main border border-border-subtle rounded-lg">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-text-muted hover:text-text-main border border-border-subtle rounded-lg">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {filteredRequests.map((req) => (
            <div key={req.id} className="p-4 sm:p-6 hover:bg-bg-hover transition-colors">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${req.name}&background=random`} 
                    alt={req.name} 
                    className="w-10 h-10 rounded-full border border-border-subtle"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-text-main">{req.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(req.type)}`}>
                        {req.type}
                      </span>
                    </div>
                    <div className="text-sm text-text-muted mb-2">
                      {req.startDate} to {req.endDate} ({req.days} days)
                    </div>
                    <p className="text-sm text-text-muted bg-bg-deep p-2 rounded border border-border-subtle inline-block">
                      "{req.reason}"
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end justify-between">
                  <div className="mb-4">
                    {getStatusBadge(req.status)}
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/15 hover:bg-red-500/25 rounded-lg transition-colors">
                        Reject
                      </button>
                      <button className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                        Approve
                      </button>
                    </div>
                  )}
                  {req.status !== 'pending' && (
                    <div className="text-xs text-text-muted">
                      Applied on {req.appliedOn}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredRequests.length === 0 && (
            <div className="p-8 text-center text-text-muted">
              No {activeTab} leave requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
