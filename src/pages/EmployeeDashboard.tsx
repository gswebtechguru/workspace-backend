import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tasks, projects, attendanceRecords, notifications, getProjectName } from '../data/mockData';
import { Clock, CheckCircle2, AlertTriangle, Calendar, Plus, TrendingUp, LogOut, Bell, FolderKanban, ArrowRight } from 'lucide-react';

export default function EmployeeDashboard() {
  const { employee, notifications: userNotifs } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  if (!employee) return null;

  const todayAttendance = attendanceRecords.find(a => a.employeeId === employee.id && a.workDate === today);
  const myTasks = tasks.filter(t => t.assigneeIds.includes(employee.id));
  const todayTasks = myTasks.filter(t => t.scheduledDate === today);
  const overdueTasks = myTasks.filter(t => t.isOverdue && t.status !== 'completed');
  const completedToday = todayTasks.filter(t => t.status === 'completed');
  const inProgress = todayTasks.filter(t => t.status === 'in_progress');
  const myProjects = projects.filter(p => p.members.some(m => m.employeeId === employee.id));
  const totalEstimatedToday = todayTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalActualToday = todayTasks.reduce((s, t) => s + t.actualMinutes, 0);
  const unreadNotifs = userNotifs.filter(n => !n.isRead);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {employee.firstName}!</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Task</button>
      </div>

      {/* Attendance Status */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${todayAttendance?.checkInAt ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Clock className={`w-6 h-6 ${todayAttendance?.checkInAt ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {todayAttendance?.checkInAt ? `Checked in at ${new Date(todayAttendance.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not checked in yet'}
            </p>
            <p className="text-sm text-gray-500">
              {todayAttendance?.checkOutAt ? `Checked out at ${new Date(todayAttendance.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : todayAttendance?.checkInAt ? 'Working • Remember to check out' : 'Login-based attendance • Auto check-in on first login'}
            </p>
          </div>
        </div>
        {todayAttendance?.checkInAt && !todayAttendance?.checkOutAt && (
          <button className="btn-secondary">Check Out</button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-xl font-bold text-gray-900">{todayTasks.length}</p><p className="text-xs text-gray-500">Today's Tasks</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-xl font-bold text-gray-900">{completedToday.length}</p><p className="text-xs text-gray-500">Completed</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-xl font-bold text-gray-900">{overdueTasks.length}</p><p className="text-xs text-gray-500">Overdue</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-xl font-bold text-gray-900">{(totalActualToday / 60).toFixed(1)}h</p><p className="text-xs text-gray-500">of {(totalEstimatedToday / 60).toFixed(1)}h planned</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No tasks planned for today. Click "Add Task" to plan your day.</p>
            ) : todayTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${t.status === 'completed' ? 'bg-green-500' : t.status === 'in_progress' ? 'bg-blue-500' : t.isOverdue ? 'bg-red-500' : 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.title}</p>
                  <p className="text-xs text-gray-500">{getProjectName(t.projectId)} • Est: {(t.estimatedMinutes / 60).toFixed(1)}h</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.isOverdue && t.status !== 'completed' && <span className="badge bg-red-100 text-red-700">Overdue</span>}
                  <span className={`badge ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Projects */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h3>
              {unreadNotifs.length > 0 && <span className="badge bg-red-100 text-red-700">{unreadNotifs.length} new</span>}
            </div>
            <div className="space-y-2">
              {userNotifs.slice(0, 4).map(n => (
                <div key={n.id} className={`p-2.5 rounded-lg text-sm ${!n.isRead ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                  <p className="font-medium text-gray-900 text-xs">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Projects */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><FolderKanban className="w-4 h-4" /> My Projects</h3>
            <div className="space-y-2">
              {myProjects.map(p => (
                <div key={p.id} className="p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <span className="text-xs font-medium text-indigo-600">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="card p-5 border-l-4 border-l-red-500">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5" /> Overdue Tasks ({overdueTasks.length})</h3>
          <div className="space-y-2">
            {overdueTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-500">{getProjectName(t.projectId)} • Due: {t.dueDate || t.scheduledDate}</p>
                </div>
                <button className="text-xs text-red-600 font-medium hover:text-red-800">Update</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
