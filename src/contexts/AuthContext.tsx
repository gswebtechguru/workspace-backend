import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, Employee, Notification } from '../types';
import { employees, notifications as mockNotifications } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['*'],
  admin_hr: ['employees.view','employees.create','employees.update','projects.view','projects.create','attendance.view','attendance.correct','leave.view','leave.approve','reports.view_company','reports.export','settings.manage','announcements.manage'],
  project_manager: ['projects.view','projects.create','projects.assign_members','tasks.view','tasks.create','tasks.assign','tasks.complete','tasks.reopen','time_entries.create','reports.view_team','chat.send','notifications.view'],
  employee: ['tasks.view','tasks.create','tasks.complete','time_entries.create','reports.view_own','chat.send','notifications.view','attendance.view','leave.create'],
  viewer: ['projects.view','tasks.view','reports.view_own'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);

  const login = useCallback(async (username: string, _password: string): Promise<boolean> => {
    // Mock authentication - in production this calls POST /api/v1/auth/login
    const emp = employees.find(e => e.email === username || e.employeeId === username);
    if (!emp) return false;
    
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
    setUserNotifications(mockNotifications.filter(n => n.userId === emp.userId));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setEmployee(null);
    setUserNotifications([]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setUserNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const perms = rolePermissions[user.role] || [];
    if (perms.includes('*')) return true;
    return perms.includes(permission);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, employee, isAuthenticated: !!user, login, logout, notifications: userNotifications, markNotificationRead, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
