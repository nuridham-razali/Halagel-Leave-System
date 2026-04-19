import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Activity, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { employeeData, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/leave-requests', icon: CalendarDays, label: 'Leave Requests' },
    { to: '/analytics', icon: Activity, label: 'Behavior Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = employeeData?.role === 'Employee' 
    ? allNavItems.filter(item => item.to === '/' || item.to === '/leave-requests')
    : allNavItems;

  return (
    <div className="min-h-screen bg-bg-deep flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-bg-deep border-r border-border-subtle text-text-main transition-transform duration-300 ease-in-out flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 font-bold text-lg border-b border-border-subtle">
          <div className="w-8 h-8 bg-indigo-500 rounded-md mr-3 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="truncate" title="Halagel Leave Monitoring System">Halagel Leave System</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-bg-card text-indigo-500" 
                  : "text-text-muted hover:bg-bg-hover hover:text-text-main"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center mb-4 px-2">
            <img 
              src={employeeData?.profile_photo_url || `https://ui-avatars.com/api/?name=${employeeData?.name}&background=random`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-border-subtle"
            />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-text-main truncate">{employeeData?.name}</p>
              <p className="text-xs text-text-muted truncate">{employeeData?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-text-muted rounded-lg hover:bg-bg-hover hover:text-text-main transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-bg-deep border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 mr-3 text-text-muted hover:text-text-main rounded-md hover:bg-bg-hover"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="max-w-md w-full hidden sm:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-text-muted" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-border-subtle rounded-md leading-5 bg-bg-card text-text-main placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="Search employees, requests..."
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-text-muted hover:text-text-main transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="relative p-2 text-text-muted hover:text-text-main transition-colors">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-bg-deep" />
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-bg-deep p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
