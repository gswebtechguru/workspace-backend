import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, Employee } from '../types';
import { employees } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; redirectPath: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['*'],
  admin_hr: ['employees.view','employees.create','employees.update','projects.view','projects.create','attendance.view','attendance.correct','leave.view','leave.approve','reports.view_company','reports.export','settings.manage','announcements.manage'],
  project_manager: ['employees.view','projects.view','projects.create','projects.assign_members','tasks.view','tasks.create','tasks.assign','tasks.complete','tasks.reopen','time_entries.create','reports.view_team','chat.send','notifications.view','attendance.view','leave.view'],
  employee: ['tasks.view','tasks.create','tasks.complete','time_entries.create','reports.view_own','chat.send','notifications.view','attendance.view','leave.create'],
  viewer: ['projects.view','tasks.view','reports.view_own'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const login = useCallback(async (username: string, _password: string): Promise<{ success: boolean; redirectPath: string }> => {
    const emp = employees.find(e => 
      e.email.toLowerCase() === username.toLowerCase() || 
      e.employeeId.toLowerCase() === username.toLowerCase()
    );
    if (!emp) return { success: false, redirectPath: '/login' };
    if (emp.status !== 'active') return { success: false, redirectPath: '/login' };
    
    const mockUser: User = {
      id: emp.userId,
      username: emp.email.split('@')[0],
      email: emp.email,
      role: emp.role,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: emp.joiningDate,
    };
    
    setUser(mockUser);
    setEmployee(emp);
    
    // Determine redirect based on role
    const isAdminRole = emp.role === 'super_admin' || emp.role === 'admin_hr' || emp.role === 'project_manager';
    const redirectPath = isAdminRole ? '/dashboard' : '/my-dashboard';
    
    return { success: true, redirectPath };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setEmployee(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const perms = rolePermissions[user.role] || [];
    if (perms.includes('*')) return true;
    return perms.includes(permission);
  }, [user]);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin_hr';
  const isManager = user?.role === 'project_manager' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, employee, isAuthenticated: !!user, login, logout, hasPermission, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
