import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderKanban, CheckSquare, Clock, AlertTriangle, TrendingUp, Calendar, FileWarning, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { dashboardMetrics, projects, tasks, employees, attendanceRecords, leaveRequests } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { DateFilter } from '../types';

const dateFilters: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Today' }, { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' }, { value: 'last_month', label: 'Last Month' },
];

const taskStatusData = [
  { name: 'Completed', value: 24, color: '#10b981' },
  { name: 'In Progress', value: 18, color: '#3b82f6' },
  { name: 'Planned', value: 12, color: '#f59e0b' },
  { name: 'Blocked', value: 4, color: '#ef4444' },
  { name: 'Overdue', value: 3, color: '#dc2626' },
];

const weeklyCompletion = [
  { day: 'Mon', completed: 8, planned: 10 }, { day: 'Tue', completed: 12, planned: 11 },
  { day: 'Wed', completed: 9, planned: 12 }, { day: 'Thu', completed: 14, planned: 13 },
  { day: 'Fri', completed: 11, planned: 14 }, { day: 'Sat', completed: 3, planned: 4 },
  { day: 'Sun', completed: 0, planned: 0 },
];

const projectProgress = [
  { name: 'E-Commerce', estimated: 2400, actual: 1680 },
  { name: 'Mobile Banking', estimated: 3200, actual: 1200 },
  { name: 'HR Portal', estimated: 800, actual: 520 },
  { name: 'Analytics', estimated: 1200, actual: 600 },
];

export default function AdminDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const m = dashboardMetrics;

  const statCards = [
    { label: 'Present Today', value: m.presentToday, total: m.totalEmployees, icon: Users, color: 'bg-green-500', change: '+2', trend: 'up' },
    { label: 'Active Projects', value: m.activeProjects, icon: FolderKanban, color: 'bg-blue-500', change: '+1', trend: 'up' },
    { label: 'Completed Tasks', value: m.completedTasks, icon: CheckSquare, color: 'bg-emerald-500', change: '+5', trend: 'up' },
    { label: 'Overdue Tasks', value: m.overdueTasks, icon: AlertTriangle, color: 'bg-red-500', change: '+1', trend: 'down' },
    { label: 'Absent Today', value: m.absentToday, icon: Clock, color: 'bg-amber-500' },
    { label: 'Pending Leave', value: m.pendingLeaveRequests, icon: FileWarning, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of company operations and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {dateFilters.map(f => (
            <button key={f.value} onClick={() => setDateFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {card.change && (
                  <span className={`flex items-center text-xs font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              {card.total && <p className="text-xs text-gray-400">of {card.total} total</p>}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Weekly Task Completion
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b98120" name="Completed" />
              <Area type="monotone" dataKey="planned" stroke="#3b82f6" fill="#3b82f620" name="Planned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Distribution */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {taskStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {taskStatusData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium text-gray-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Progress & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Hours */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Estimated vs Actual Hours by Project</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="estimated" fill="#e0e7ff" name="Estimated" radius={[4,4,0,0]} />
              <Bar dataKey="actual" fill="#6366f1" name="Actual" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Milestones */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming Milestones
          </h3>
          <div className="space-y-3">
            {m.upcomingMilestones.map(ms => (
              <div key={ms.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{ms.title}</p>
                <p className="text-xs text-gray-500 mt-1">Due: {ms.dueDate}</p>
                <span className={`badge mt-1 ${ms.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ms.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ms.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delayed Projects */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Projects Requiring Attention</h3>
          <div className="space-y-3">
            {projects.filter(p => p.status === 'active').map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.members.length} members • Due {p.targetDeliveryDate}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.progress >= 75 ? 'bg-green-500' : p.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{p.progress}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pending Leave Requests</h3>
          <div className="space-y-3">
            {leaveRequests.filter(l => l.status === 'pending').map(l => {
              const emp = employees.find(e => e.id === l.employeeId);
              return (
                <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                      {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-xs text-gray-500">{l.startDate} to {l.endDate} • {l.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Approve</button>
                    <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
                  </div>
                </div>
              );
            })}
            {leaveRequests.filter(l => l.status === 'pending').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Today's Attendance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Employee</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Check In</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Check Out</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Source</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.filter(a => a.workDate === new Date().toISOString().split('T')[0]).map(a => {
                const emp = employees.find(e => e.id === a.employeeId);
                return (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                        </div>
                        <span className="font-medium">{emp?.firstName} {emp?.lastName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="py-2 px-3 text-gray-600">{a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`badge ${a.status === 'present' ? 'bg-green-100 text-green-700' : a.status === 'late' ? 'bg-amber-100 text-amber-700' : a.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{a.source.replace('_', ' ')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
