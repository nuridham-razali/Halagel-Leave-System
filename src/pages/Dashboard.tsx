import React, { useState, useEffect } from 'react';
import { Users, Clock, CalendarCheck, TrendingUp, AlertTriangle, Plus, FileText } from 'lucide-react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const { employeeData, user } = useAuth();
  const navigate = useNavigate();

  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  useEffect(() => {
    if (employeeData?.role === 'Employee' && user) {
      const fetchMyLeaves = async () => {
        setLoadingLeaves(true);
        try {
          const q = query(collection(db, 'leave_requests'), where('employee_id', '==', user.uid), orderBy('applied_date', 'desc'));
          const snapshot = await getDocs(q);
          setMyLeaves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching my leaves", error);
        } finally {
          setLoadingLeaves(false);
        }
      };
      fetchMyLeaves();
    }
  }, [employeeData, user]);

  // Rest of original code...
  const donutOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif', background: 'transparent' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    labels: ['MC', 'Annual Leave', 'Unpaid Leave', 'Emergency', 'Compassionate'],
    colors: ['#EF4444', '#10B981', '#6B7280', '#F59E0B', '#6366F1'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    stroke: { colors: [isDarkMode ? '#161a22' : '#ffffff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true },
            value: { show: true }
          }
        }
      }
    }
  };
  const donutSeries = [45, 120, 15, 8, 5];

  const barOptions: ApexOptions = {
    chart: { type: 'bar', stacked: true, fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    colors: ['#EF4444', '#10B981', '#6B7280', '#F59E0B', '#6366F1'],
    legend: { position: 'top' },
    dataLabels: { enabled: false },
    grid: { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)' }
  };
  const barSeries = [
    { name: 'MC', data: [12, 15, 8, 20, 14, 10] },
    { name: 'Annual', data: [30, 25, 40, 35, 50, 45] },
    { name: 'Unpaid', data: [2, 0, 5, 1, 0, 3] },
    { name: 'Emergency', data: [1, 2, 0, 1, 0, 1] },
    { name: 'Compassionate', data: [0, 0, 3, 0, 0, 0] }
  ];

  const lineOptions: ApexOptions = {
    chart: { type: 'line', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#6366F1'],
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    grid: { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)' },
    annotations: {
      yaxis: [{
        y: 50,
        borderColor: '#EF4444',
        label: {
          borderColor: '#EF4444',
          style: { color: '#fff', background: '#EF4444' },
          text: 'Risk Threshold (50)'
        }
      }]
    },
    yaxis: { min: 0, max: 100 }
  };
  const lineSeries = [{ name: 'Avg Behavior Score', data: [85, 82, 78, 80, 75, 72] }];

  const flaggedEmployees = [
    { id: 1, name: 'John Doe', dept: 'Engineering', score: 45, risk: 'High', flags: ['Frequent Monday MC'] },
    { id: 2, name: 'Jane Smith', dept: 'Sales', score: 48, risk: 'High', flags: ['Consecutive MC'] },
    { id: 3, name: 'Mike Johnson', dept: 'Production', score: 52, risk: 'Medium', flags: ['High Unpaid Leave'] },
  ];

  if (employeeData && employeeData.role === 'Employee') {
    const annualUsed = myLeaves.filter(l => l.leave_type === 'Annual Leave' && l.status === 'approved').reduce((acc, curr) => acc + curr.total_days, 0);
    const mcUsed = myLeaves.filter(l => l.leave_type === 'Medical Leave (MC)' && l.status === 'approved').reduce((acc, curr) => acc + curr.total_days, 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main">My Dashboard</h1>
            <div className="text-sm text-text-muted">Welcome back, {employeeData?.name || 'User'}</div>
          </div>
          <button 
            onClick={() => navigate('/leave-requests')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>

        {/* My KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-card rounded-xl border border-border-subtle p-6 flex items-center">
            <div className="bg-indigo-500/15 p-3 rounded-lg mr-4">
              <CalendarCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Annual Leave</p>
              <p className="text-2xl font-bold text-text-main mt-1">
                {(employeeData?.total_annual_leave_entitlement || 14) - annualUsed} <span className="text-sm text-text-muted font-normal">/ {employeeData?.total_annual_leave_entitlement || 14} remaining</span>
              </p>
            </div>
          </div>
          <div className="bg-red-500/10 rounded-xl border border-border-subtle p-6 flex items-center">
            <div className="bg-red-500/15 p-3 rounded-lg mr-4">
              <Plus className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Medical Leave (MC)</p>
              <p className="text-2xl font-bold text-text-main mt-1">
                {(employeeData?.total_mc_entitlement || 14) - mcUsed} <span className="text-sm text-text-muted font-normal">/ {employeeData?.total_mc_entitlement || 14} remaining</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-main">My Recent Leaves</h2>
            <Link to="/leave-requests" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-subtle">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {loadingLeaves ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-text-muted">Loading...</td></tr>
                ) : myLeaves.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-text-muted">No leave requests found</td></tr>
                ) : (
                  myLeaves.slice(0, 5).map((req) => (
                    <tr key={req.id} className="hover:bg-bg-hover">
                      <td className="px-4 py-3 text-sm text-text-main">{req.leave_type}</td>
                      <td className="px-4 py-3 text-sm text-text-main">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-text-main">{req.total_days}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'approved' ? 'bg-emerald-500/15 text-emerald-500' : 
                          req.status === 'rejected' ? 'bg-red-500/15 text-red-500' : 
                          'bg-amber-500/15 text-amber-500'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Dashboard Overview</h1>
          <div className="text-sm text-text-muted">Last updated: Today, 09:00 AM</div>
        </div>
        <button 
          onClick={() => navigate('/leave-requests')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/employees" className="bg-bg-card rounded-xl border border-border-subtle p-6 flex items-center hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div className="bg-indigo-500/15 p-3 rounded-lg mr-4">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Employees</p>
            <p className="text-2xl font-bold text-text-main mt-1">156</p>
          </div>
        </Link>
        <Link to="/leave-requests" className="bg-bg-card rounded-xl border border-border-subtle p-6 flex items-center hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div className="bg-amber-500/15 p-3 rounded-lg mr-4">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Pending Requests</p>
            <p className="text-2xl font-bold text-text-main mt-1">12</p>
          </div>
        </Link>
        <Link to="/leave-requests" className="bg-bg-card rounded-xl border border-border-subtle p-6 flex items-center hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div className="bg-emerald-500/15 p-3 rounded-lg mr-4">
            <CalendarCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">On Leave Today</p>
            <p className="text-2xl font-bold text-text-main mt-1">8</p>
          </div>
        </Link>
        <Link to="/analytics" className="bg-bg-card rounded-xl border border-border-subtle p-6 flex items-center hover:border-indigo-500/50 transition-colors cursor-pointer">
          <div className="bg-blue-500/15 p-3 rounded-lg mr-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Avg Behavior Score</p>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold text-text-main">72</p>
              <span className="ml-2 text-sm text-red-500 flex items-center">
                ↓ 3%
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-text-main mb-4">Leave Distribution</h2>
          <div className="h-64">
            <Chart options={donutOptions} series={donutSeries} type="donut" height="100%" />
          </div>
        </div>
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-text-main mb-4">Monthly Leave Trends</h2>
          <div className="h-64">
            <Chart options={barOptions} series={barSeries} type="bar" height="100%" />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6">
          <h2 className="text-lg font-semibold text-text-main mb-4">Behavior Trend (12 Months)</h2>
          <div className="h-64">
            <Chart options={lineOptions} series={lineSeries} type="line" height="100%" />
          </div>
        </div>
        
        <div className="bg-bg-card rounded-xl border border-border-subtle p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text-main">Flagged Employees</h2>
            <Link to="/employees" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</Link>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-border-subtle">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Flags</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {flaggedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-bg-hover">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-main">{emp.name}</div>
                      <div className="text-xs text-text-muted">{emp.dept}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        emp.score < 50 ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {emp.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-text-muted">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mr-1" />
                        {emp.flags[0]}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <Link to="/employees" className="text-indigo-400 hover:text-indigo-300">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
