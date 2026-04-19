import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter, Plus, X } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function LeaveRequests() {
  const { employeeData, user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'Annual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employeeData && user) {
      fetchRequests();
    }
  }, [employeeData, user]);

  const fetchRequests = async () => {
    if (!employeeData || !user) return;
    try {
      setLoading(true);
      let q = query(collection(db, 'leave_requests'), orderBy('applied_date', 'desc'));
      
      if (employeeData.role === 'Employee') {
        q = query(collection(db, 'leave_requests'), where('employee_id', '==', user.uid), orderBy('applied_date', 'desc'));
      } else if (employeeData.role === 'Manager') {
        q = query(collection(db, 'leave_requests'), where('department', '==', employeeData.department), orderBy('applied_date', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      let reqs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (employeeData.role === 'HR') {
        reqs = reqs.filter((req: any) => req.status === 'approved' || req.status === 'rejected');
      }

      setRequests(reqs);
    } catch (error) {
      console.error("Error fetching requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeData || !user) return;
    
    try {
      setSubmitting(true);
      
      // Calculate days (simple calculation, doesn't account for weekends/holidays)
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const newRequest = {
        request_id: `REQ-${Date.now()}`,
        employee_id: user.uid,
        name: employeeData.name,
        department: employeeData.department,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: diffDays,
        reason: formData.reason,
        status: 'pending',
        applied_date: new Date().toISOString()
      };

      await addDoc(collection(db, 'leave_requests'), newRequest);
      
      // Notify Managers via 'mail' collection
      try {
        const managerQuery = query(
          collection(db, 'employees'),
          where('department', '==', employeeData.department),
          where('role', '==', 'Manager')
        );
        const managerDocs = await getDocs(managerQuery);
        
        const mailPromises = managerDocs.docs.map(docSnap => {
          const managerData = docSnap.data();
          if (!managerData.email) return Promise.resolve();
          return addDoc(collection(db, 'mail'), {
            to: managerData.email,
            message: {
              subject: `New Leave Request from ${employeeData.name}`,
              html: `
                <h3>New Leave Request Action Required</h3>
                <p><strong>Employee:</strong> ${employeeData.name}</p>
                <p><strong>Leave Type:</strong> ${formData.leave_type}</p>
                <p><strong>Dates:</strong> ${formData.start_date} to ${formData.end_date} (${diffDays} days)</p>
                <p><strong>Reason:</strong> ${formData.reason || 'N/A'}</p>
                <br/>
                <p>Please log in to the Halagel Leave Monitoring System to approve or reject this request.</p>
              `
            }
          });
        });

        await Promise.all(mailPromises);
      } catch (emailErr) {
        console.error("Error sending notification email: ", emailErr);
      }

      setIsModalOpen(false);
      setFormData({ leave_type: 'Annual Leave', start_date: '', end_date: '', reason: '' });
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, employeeId: string, employeeName: string) => {
    try {
      await updateDoc(doc(db, 'leave_requests', id), {
        status: newStatus,
        approved_by: employeeData?.name
      });
      
      // Notify Employee about status change via 'mail' collection
      try {
        const empDoc = await getDocs(query(collection(db, 'employees'), where('__name__', '==', employeeId)));
        if (!empDoc.empty) {
          const empEmail = empDoc.docs[0].data().email;
          if (empEmail) {
            await addDoc(collection(db, 'mail'), {
              to: empEmail,
              message: {
                subject: `Leave Request ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                html: `
                  <h3>Leave Request Update</h3>
                  <p>Hello ${employeeName},</p>
                  <p>Your leave request has been <strong>${newStatus}</strong> by your manager.</p>
                  <br/>
                  <p>Log in to the Halagel Leave Monitoring System to view more details.</p>
                `
              }
            });
          }
        }
      } catch (emailErr) {
        console.error("Error sending update notification email: ", emailErr);
      }

      fetchRequests(); // Refresh list
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Failed to update status.");
    }
  };

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

  const canApproveReq = (req: any) => {
    if (employeeData?.role === 'Super Admin') return true;
    if (employeeData?.role === 'Manager' && employeeData?.department === req.department) return true;
    return false;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-main">Leave Requests</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
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

        <div className="divide-y divide-border-subtle min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-6 hover:bg-bg-hover transition-colors">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${req.name || 'User'}&background=random`} 
                      alt={req.name} 
                      className="w-10 h-10 rounded-full border border-border-subtle"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-text-main">{req.name || 'Unknown Employee'}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(req.leave_type)}`}>
                          {req.leave_type}
                        </span>
                      </div>
                      <div className="text-sm text-text-muted mb-2">
                        {req.start_date} to {req.end_date} ({req.total_days} days)
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
                    {req.status === 'pending' && canApproveReq(req) && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(req.id, 'rejected', req.employee_id, req.name)}
                          className="px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/15 hover:bg-red-500/25 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleStatusChange(req.id, 'approved', req.employee_id, req.name)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                    {req.status !== 'pending' && (
                      <div className="text-xs text-text-muted">
                        Applied on {new Date(req.applied_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-text-muted">
              No {activeTab} leave requests found.
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl border border-border-subtle w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle">
              <h2 className="text-xl font-bold text-text-main">Apply for Leave</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Leave Type</label>
                <select 
                  required
                  value={formData.leave_type}
                  onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                  className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="MC">Medical Certificate (MC)</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Compassionate">Compassionate Leave</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    min={formData.start_date}
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Reason</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Please provide a brief reason..."
                  className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main placeholder-text-muted focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-border-subtle text-text-main rounded-lg hover:bg-bg-hover transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
