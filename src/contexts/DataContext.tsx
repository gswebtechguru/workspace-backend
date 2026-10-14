import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Task, AttendanceRecord, ProjectMessage, Notification, LeaveRequest, Project, Employee, DailyWorkReport, Announcement, TimeEntry } from '../types';
import { tasks as initialTasks, attendanceRecords as initialAttendance, projectMessages as initialMessages, notifications as initialNotifications, leaveRequests as initialLeave, projects as initialProjects, employees as initialEmployees, dailyReports as initialReports, announcements as initialAnnouncements } from '../data/mockData';

interface DataContextType {
  tasks: Task[];
  attendanceRecords: AttendanceRecord[];
  projectMessages: ProjectMessage[];
  notifications: Notification[];
  leaveRequests: LeaveRequest[];
  projects: Project[];
  employees: Employee[];
  dailyReports: DailyWorkReport[];
  announcements: Announcement[];
  // Task operations
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string, notes?: string) => void;
  reopenTask: (id: string, reason: string) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  // Attendance
  checkOut: (employeeId: string) => void;
  // Messages
  addMessage: (msg: ProjectMessage) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  addNotification: (n: Notification) => void;
  // Leave
  addLeaveRequest: (req: LeaveRequest) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  // Projects
  updateProject: (id: string, updates: Partial<Project>) => void;
  // Employees
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  // Announcements
  addAnnouncement: (ann: Announcement) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [projectMessages, setProjectMessages] = useState<ProjectMessage[]>(initialMessages);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeave);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [dailyReports, setDailyReports] = useState<DailyWorkReport[]>(initialReports);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const completeTask = useCallback((id: string, notes?: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newHistory = [...t.statusHistory, {
        id: `sh_${Date.now()}`,
        fromStatus: t.status,
        toStatus: 'completed' as const,
        changedBy: 'current_user',
        changedAt: now,
      }];
      return { ...t, status: 'completed' as const, completedAt: now, completionNotes: notes, statusHistory: newHistory };
    }));
  }, []);

  const reopenTask = useCallback((id: string, reason: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newHistory = [...t.statusHistory, {
        id: `sh_${Date.now()}`,
        fromStatus: t.status,
        toStatus: 'in_progress' as const,
        changedBy: 'current_user',
        changedAt: now,
        reason,
      }];
      return { ...t, status: 'in_progress' as const, completedAt: undefined, statusHistory: newHistory };
    }));
  }, []);

  const addTimeEntry = useCallback((entry: TimeEntry) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== entry.taskId) return t;
      const newActual = t.actualMinutes + entry.durationMinutes;
      return { ...t, timeEntries: [...t.timeEntries, entry], actualMinutes: newActual };
    }));
  }, []);

  const checkOut = useCallback((employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    setAttendanceRecords(prev => prev.map(a => {
      if (a.employeeId === employeeId && a.workDate === today) {
        return { ...a, checkOutAt: now, isMissingCheckout: false };
      }
      return a;
    }));
  }, []);

  const addMessage = useCallback((msg: ProjectMessage) => {
    setProjectMessages(prev => [...prev, msg]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const addNotification = useCallback((n: Notification) => {
    setNotifications(prev => [n, ...prev]);
  }, []);

  const addLeaveRequest = useCallback((req: LeaveRequest) => {
    setLeaveRequests(prev => [req, ...prev]);
  }, []);

  const updateLeaveRequest = useCallback((id: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addEmployee = useCallback((emp: Employee) => {
    setEmployees(prev => [emp, ...prev]);
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const addAnnouncement = useCallback((ann: Announcement) => {
    setAnnouncements(prev => [ann, ...prev]);
  }, []);

  return (
    <DataContext.Provider value={{
      tasks, attendanceRecords, projectMessages, notifications, leaveRequests, projects, employees, dailyReports, announcements,
      addTask, updateTask, completeTask, reopenTask, addTimeEntry,
      checkOut, addMessage, markNotificationRead, addNotification,
      addLeaveRequest, updateLeaveRequest, updateProject,
      addEmployee, updateEmployee, addAnnouncement,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
