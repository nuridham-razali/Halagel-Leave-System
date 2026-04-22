import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import LeaveRequests from './pages/LeaveRequests';
import BehaviorAnalytics from './pages/BehaviorAnalytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, dbError } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-deep text-text-main">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-deep p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-lg text-center">
          <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-main mb-2">Database Connection Error</h2>
          <p className="text-text-muted mb-6">{dbError}</p>
          <div className="text-left bg-bg-deep p-4 rounded-lg text-sm text-text-muted">
            <p className="font-semibold text-text-main mb-2">How to fix this in your AI Studio project:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open your Firebase Console and select your project.</li>
              <li>Go to Project Settings (gear icon) &rarr; Web App.</li>
              <li>Copy the <code className="bg-bg-hover px-1 rounded text-red-400">apiKey</code> from the config block.</li>
              <li>If you are in Vercel: add it to <code className="bg-bg-hover px-1 rounded text-red-400">VITE_FIREBASE_API_KEY</code>.</li>
              <li>If you edited the config file here: ensure it matches perfectly.</li>
              <li>Ensure you have clicked "Create Database" in Firestore.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="analytics" element={<BehaviorAnalytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
