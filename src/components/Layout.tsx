import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { LayoutDashboard, Users, FolderKanban, CheckSquare, Clock, MessageSquare, FileText, Bell, Settings, LogOut, Menu, X, ChevronDown, Search, Building2, Megaphone } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

const adminNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const employeeNav = [
  { path: '/my-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { path: '/my-projects', label: 'My Projects', icon: FolderKanban },
  { path: '/my-tasks', label: 'Daily Planner', icon: CheckSquare },
  { path: '/my-attendance', label: 'Attendance', icon: Clock },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/my-reports', label: 'Work History', icon: FileText },
];

export default function Layout({ children }: LayoutProps) {
  const { user, employee, logout, isManager } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navItems = isManager ? adminNav : employeeNav;
  const userNotifs = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:in-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Building2 className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight">WorkForce Pro</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {employee?.firstName?.[0]}{employee?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{employee?.firstName} {employee?.lastName}</p>
              <p className="text-xs text-slate-400 truncate">{employee?.designation}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search employees, projects, tasks..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {userNotifs.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-gray-500 text-center">No notifications</p>
                    ) : userNotifs.map(n => (
                      <div key={n.id} onClick={() => markNotificationRead(n.id)}
                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                  {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium">{employee?.firstName} {employee?.lastName}</p>
                    <p className="text-xs text-gray-500">{employee?.email}</p>
                    <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full mt-1">{user?.role?.replace('_', ' ')}</span>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { navigate('/profile'); setShowProfile(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">My Profile</button>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
