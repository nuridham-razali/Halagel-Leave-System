import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, ShieldAlert, X, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Employees() {
  const { employeeData } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', company: '', department: '', role: 'Employee' });
  const [employeeToDelete, setEmployeeToDelete] = useState<{ id: string, name: string } | null>(null);

  const [historyEmployee, setHistoryEmployee] = useState<{ id: string, name: string } | null>(null);
  const [historyLeaves, setHistoryLeaves] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async (emp: { id: string; name: string }) => {
    setHistoryEmployee(emp);
    setLoadingHistory(true);
    try {
      // Find the employee doc containing the user uid
      const empDoc = employees.find(e => e.id === emp.id);
      if (!empDoc) return;
      
      const q = query(collection(db, 'leave_requests'), where('employee_id', '==', empDoc.employee_id || emp.id), orderBy('applied_date', 'desc'));
      const querySnapshot = await getDocs(q);
      const reqs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistoryLeaves(reqs);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const companies = [
    'HALAGEL (M) SDN BHD',
    'HALAGEL PLANT (M) SDN BHD',
    'HALAGEL PRODUCTS'
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const emps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(emps);
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (empId: string, newRole: string) => {
    if (employeeData?.role !== 'Super Admin') return;
    
    try {
      setUpdatingId(empId);
      await updateDoc(doc(db, 'employees', empId), { role: newRole });
      setEmployees(employees.map(emp => emp.id === empId ? { ...emp, role: newRole } : emp));
    } catch (error) {
      console.error("Error updating role", error);
      alert("Failed to update role. Check permissions.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDepartmentChange = async (empId: string, newDepartment: string) => {
    if (employeeData?.role !== 'Super Admin' && employeeData?.role !== 'HR') return;
    
    try {
      setUpdatingId(empId);
      await updateDoc(doc(db, 'employees', empId), { department: newDepartment });
      setEmployees(employees.map(emp => emp.id === empId ? { ...emp, department: newDepartment } : emp));
    } catch (error) {
      console.error("Error updating department", error);
      alert("Failed to update department. Check permissions.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEmployee = async (empId: string, empName: string) => {
    if (employeeData?.role !== 'Super Admin' && employeeData?.role !== 'HR') {
      console.error("You do not have permission to delete employees.");
      return;
    }
    setEmployeeToDelete({ id: empId, name: empName });
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteDoc(doc(db, 'employees', employeeToDelete.id));
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
    } catch (error) {
      console.error("Error deleting employee", error);
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeData?.role !== 'Super Admin') {
      alert("Only Super Admin can add employees.");
      return;
    }
    try {
      await addDoc(collection(db, 'employees'), {
        ...newEmployee,
        employee_id: `EMP-${Date.now()}`,
        status: 'active',
        behavior_score: 100,
        join_date: new Date().toISOString().split('T')[0]
      });
      setIsAddModalOpen(false);
      setNewEmployee({ name: '', email: '', company: '', department: '', role: 'Employee' });
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee", error);
      alert("Failed to add employee.");
    }
  };

  const filteredEmployees = employees.filter(emp => {
    // Role-based visibility logic
    if (employeeData?.role === 'Manager') {
      if (emp.department !== employeeData?.department) {
        return false;
      }
    }

    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === 'All' || emp.company === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Employee Directory</h1>
          <p className="text-sm text-text-muted">Manage staff records and view behavior profiles</p>
        </div>
        <div className="flex items-center gap-2">
          {employeeData?.role === 'Super Admin' && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="bg-bg-card p-4 rounded-xl border border-border-subtle flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, email, or department..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-deep border border-border-subtle rounded-lg text-text-main placeholder-text-muted focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-4 py-2 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="All">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          <div className="flex border border-border-subtle rounded-lg overflow-hidden">
            <button 
              onClick={() => setView('grid')}
              className={`px-3 py-2 ${view === 'grid' ? 'bg-bg-hover text-text-main' : 'text-text-muted hover:bg-bg-hover'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-3 py-2 border-l border-border-subtle ${view === 'list' ? 'bg-bg-hover text-text-main' : 'text-text-muted hover:bg-bg-hover'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-bg-card rounded-xl border border-border-subtle p-6 flex flex-col items-center text-center relative hover:border-indigo-500/50 transition-colors">
              <button className="absolute top-4 right-4 text-text-muted hover:text-text-main">
                <MoreVertical className="w-5 h-5" />
              </button>
              <img src={emp.profile_photo_url || `https://ui-avatars.com/api/?name=${emp.name}&background=random`} alt={emp.name} className="w-20 h-20 rounded-full mb-4 border-4 border-bg-deep" />
              <h3 className="text-lg font-semibold text-text-main">{emp.name}</h3>
              <p className="text-sm text-text-muted mb-1">{emp.email}</p>
              
              <div className="flex gap-2 justify-center w-full mb-4">
                {(employeeData?.role === 'Super Admin' || employeeData?.role === 'HR') ? (
                  <select 
                    value={emp.department || ''}
                    onChange={(e) => handleDepartmentChange(emp.id, e.target.value)}
                    disabled={updatingId === emp.id}
                    title="Change Department"
                    className="mt-2 bg-bg-deep border border-border-subtle rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-indigo-500 max-w-[120px] truncate"
                  >
                    <option value="" disabled>Dept</option>
                    <option value="Admin / HR">Admin / HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="QA/QC">QA/QC</option>
                    <option value="Selfcare">Selfcare</option>
                    <option value="Toothpaste">Toothpaste</option>
                    <option value="Rocksalt">Rocksalt</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="R&D">R&D</option>
                    <option value="SCM">SCM</option>
                    <option value="Production">Production</option>
                  </select>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-border-subtle text-xs text-text-muted mt-2 truncate max-w-[120px]" title={emp.department}>
                    {emp.department || 'N/A'}
                  </span>
                )}

                {employeeData?.role === 'Super Admin' ? (
                  <select 
                    value={emp.role || 'Employee'}
                    onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                    disabled={updatingId === emp.id}
                    title="Change Role"
                    className="mt-2 bg-bg-deep border border-border-subtle rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-indigo-500 max-w-[100px]"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="HR">HR</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-300 mt-2">
                    {emp.role || 'Employee'}
                  </span>
                )}
              </div>
              
              <div className="w-full border-t border-border-subtle pt-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-text-muted">Behavior Score</span>
                  <span className={`text-xs font-bold ${
                    (emp.behavior_score || 100) >= 70 ? 'text-emerald-500' : (emp.behavior_score || 100) >= 50 ? 'text-amber-500' : 'text-red-500'
                  }`}>{(emp.behavior_score || 100)}/100</span>
                </div>
                <div className="w-full bg-bg-deep rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      (emp.behavior_score || 100) >= 70 ? 'bg-emerald-500' : (emp.behavior_score || 100) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${(emp.behavior_score || 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-full flex gap-2 mt-4">
                <button 
                  onClick={() => alert(`Viewing profile for ${emp.name}`)}
                  className="flex-1 bg-indigo-500/15 text-indigo-400 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500/25 transition-colors"
                >
                  Profile
                </button>
                <button 
                  onClick={() => fetchHistory({ id: emp.id, name: emp.name })}
                  className="flex-1 border border-border-subtle text-text-main py-2 rounded-lg text-sm font-medium hover:bg-bg-hover transition-colors"
                >
                  History
                </button>
                {(employeeData?.role === 'Super Admin' || employeeData?.role === 'HR') && (
                  <button 
                    onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                    className="flex-none px-3 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-bg-card rounded-xl border border-border-subtle overflow-hidden">
          <table className="min-w-full divide-y divide-border-subtle">
            <thead className="bg-bg-hover">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-bg-hover">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full" src={emp.profile_photo_url || `https://ui-avatars.com/api/?name=${emp.name}&background=random`} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text-main">{emp.name}</div>
                        <div className="text-sm text-text-muted">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(employeeData?.role === 'Super Admin' || employeeData?.role === 'HR') ? (
                      <select 
                        value={emp.department || ''}
                        onChange={(e) => handleDepartmentChange(emp.id, e.target.value)}
                        disabled={updatingId === emp.id}
                        className="bg-bg-deep border border-border-subtle rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-indigo-500 w-full max-w-[150px]"
                      >
                        <option value="" disabled>Select Dept...</option>
                        <option value="Admin / HR">Admin / HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="QA/QC">QA/QC</option>
                        <option value="Selfcare">Selfcare</option>
                        <option value="Toothpaste">Toothpaste</option>
                        <option value="Rocksalt">Rocksalt</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="R&D">R&D</option>
                        <option value="SCM">SCM</option>
                        <option value="Production">Production</option>
                      </select>
                    ) : (
                      <div className="text-sm text-text-main">{emp.department || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employeeData?.role === 'Super Admin' ? (
                      <select 
                        value={emp.role || 'Employee'}
                        onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                        disabled={updatingId === emp.id}
                        className="bg-bg-deep border border-border-subtle rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="HR">HR</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-500/15 text-gray-300">
                        {emp.role || 'Employee'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/15 text-emerald-500">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        (emp.behavior_score || 100) >= 70 ? 'text-emerald-500' : (emp.behavior_score || 100) >= 50 ? 'text-amber-500' : 'text-red-500'
                      }`}>{(emp.behavior_score || 100)}</span>
                      {(emp.behavior_score || 100) < 50 && <ShieldAlert className="w-4 h-4 text-red-500 ml-2" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => alert(`Viewing profile for ${emp.name}`)} className="text-indigo-400 hover:text-indigo-300 mr-3 hidden sm:inline">Profile</button>
                    <button onClick={() => fetchHistory({ id: emp.id, name: emp.name })} className="text-emerald-500 hover:text-emerald-400 mr-3">History</button>
                    {(employeeData?.role === 'Super Admin' || employeeData?.role === 'HR') && (
                      <button 
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="text-red-500 hover:text-red-400"
                        title="Delete Employee"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl border border-border-subtle w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle">
              <h2 className="text-xl font-bold text-text-main">Add New Employee</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Company</label>
                <select 
                  required
                  value={newEmployee.company}
                  onChange={(e) => setNewEmployee({...newEmployee, company: e.target.value})}
                  className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Department</label>
                <select 
                  required
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  className="w-full p-2.5 bg-bg-deep border border-border-subtle rounded-lg text-text-main focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select Department</option>
                  <option value="Admin / HR">Admin / HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="QA/QC">QA/QC</option>
                  <option value="Selfcare">Selfcare</option>
                  <option value="Toothpaste">Toothpaste</option>
                  <option value="Rocksalt">Rocksalt</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="R&D">R&D</option>
                  <option value="SCM">SCM</option>
                  <option value="Production">Production</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-border-subtle text-text-main rounded-lg hover:bg-bg-hover transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl border border-border-subtle w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h2 className="text-xl font-bold text-text-main mb-2">Confirm Deletion</h2>
            <p className="text-text-muted mb-6">
              Are you sure you want to delete {employeeToDelete.name}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setEmployeeToDelete(null)}
                className="flex-1 px-4 py-2 bg-bg-deep border border-border-subtle text-text-main rounded-lg hover:bg-bg-hover transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl border border-border-subtle w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-border-subtle">
              <h2 className="text-xl font-bold text-text-main">Leave History: {historyEmployee.name}</h2>
              <button 
                onClick={() => setHistoryEmployee(null)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loadingHistory ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : historyLeaves.length === 0 ? (
                <div className="text-center text-text-muted py-8">
                  No leave history found for this employee.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyLeaves.map(req => (
                    <div key={req.id} className="bg-bg-deep border border-border-subtle rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-text-main">{req.leave_type}</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            req.status === 'approved' ? 'bg-emerald-500/15 text-emerald-500' : 
                            req.status === 'rejected' ? 'bg-red-500/15 text-red-500' : 
                            'bg-amber-500/15 text-amber-500'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="text-sm text-text-muted flex items-center gap-1 mb-2">
                          <Clock className="w-3 h-3" />
                          {req.start_date} to {req.end_date} ({req.total_days} days)
                        </div>
                        {req.reason && (
                          <div className="text-sm text-text-muted inline-block">
                            Reason: "{req.reason}"
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-text-muted flex flex-col justify-between">
                        <div>Applied: {new Date(req.applied_date).toLocaleDateString()}</div>
                        {req.approved_by && <div>Action by: {req.approved_by}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
