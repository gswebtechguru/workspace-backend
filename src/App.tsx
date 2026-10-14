import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Chat from './pages/Chat';
import Reports from './pages/Reports';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SettingsPage, { Announcements } from './pages/Settings';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role === 'employee') return <Navigate to="/my-dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin/Manager Routes */}
      <Route path="/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute adminOnly><Employees /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute adminOnly><Projects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute adminOnly><Projects /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute adminOnly><Tasks /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute adminOnly><Attendance /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute adminOnly><Announcements /></ProtectedRoute>} />
      
      {/* Shared Routes */}
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      
      {/* Employee Routes */}
      <Route path="/my-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/my-projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/my-tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/my-attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/my-reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'employee' ? '/my-dashboard' : '/dashboard') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
