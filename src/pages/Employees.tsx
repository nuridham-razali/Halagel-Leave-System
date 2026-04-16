import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, ShieldAlert } from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Employees() {
  const { employeeData } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
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
    fetchEmployees();
  }, []);

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

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Employee Directory</h1>
          <p className="text-sm text-text-muted">Manage staff records and view behavior profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Add Employee
          </button>
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
          <button className="flex items-center gap-2 px-4 py-2 border border-border-subtle rounded-lg text-text-main hover:bg-bg-hover">
            <Filter className="w-4 h-4" />
            Filters
          </button>
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
              
              {employeeData?.role === 'Super Admin' ? (
                <select 
                  value={emp.role || 'Employee'}
                  onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                  disabled={updatingId === emp.id}
                  className="mt-2 mb-4 bg-bg-deep border border-border-subtle rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-indigo-500"
                >
                  <option value="Employee">Employee</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-300 mb-4 mt-2">
                  {emp.role || 'Employee'}
                </span>
              )}
              
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
                <button className="flex-1 bg-indigo-500/15 text-indigo-400 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500/25 transition-colors">
                  Profile
                </button>
                <button className="flex-1 border border-border-subtle text-text-main py-2 rounded-lg text-sm font-medium hover:bg-bg-hover transition-colors">
                  History
                </button>
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
                    {employeeData?.role === 'Super Admin' ? (
                      <select 
                        value={emp.role || 'Employee'}
                        onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                        disabled={updatingId === emp.id}
                        className="bg-bg-deep border border-border-subtle rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Employee">Employee</option>
                        <option value="HR Manager">HR Manager</option>
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
                    <button className="text-indigo-400 hover:text-indigo-300 mr-3">View</button>
                    <button className="text-text-muted hover:text-text-main"><MoreVertical className="w-5 h-5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
