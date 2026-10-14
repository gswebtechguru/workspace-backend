import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Users, Calendar, X, Target, Upload, Paperclip, FileText, Download, Edit2, Trash2, Send, MessageSquare, CheckCircle2, Clock, AlertTriangle, ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import { Project, ProjectStatus, ProjectAttachment, ProjectMessage, Task } from '../types';
import { notificationSound } from '../utils/notificationSound';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-gray-100 text-gray-700', active: 'bg-green-100 text-green-700',
  on_hold: 'bg-amber-100 text-amber-700', completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700', archived: 'bg-slate-100 text-slate-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-600', critical: 'bg-red-100 text-red-600',
};

export default function Projects() {
  const { projects, tasks, addProject, updateProject, deleteProject, addProjectMember, removeProjectMember, addTask, updateTask, addMessage, projectMessages, employees: allEmployees, addNotification } = useData();
  const { employee } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'chat' | 'team'>('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [chatAttachments, setChatAttachments] = useState<ProjectAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [newProject, setNewProject] = useState({
    title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    startDate: '', targetDeliveryDate: '', technologyStack: '',
    memberIds: [] as string[]
  });
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    dueDate: '', estimatedHours: 4, assigneeIds: [] as string[]
  });
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const projectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);
  const projectMsgs = selectedProject ? projectMessages.filter(m => m.projectId === selectedProject.id && !m.isDeleted) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMsgs.length, showChatModal]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAtts: ProjectAttachment[] = Array.from(files).map(f => ({
      id: `att_${Date.now()}_${Math.random()}`,
      fileName: f.name,
      fileSize: f.size,
      mimeType: f.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: employee?.id || 'e1',
    }));
    setAttachments(prev => [...prev, ...newAtts]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAtts: ProjectAttachment[] = Array.from(files).map(f => ({
      id: `att_${Date.now()}_${Math.random()}`,
      fileName: f.name,
      fileSize: f.size,
      mimeType: f.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: employee?.id || 'e1',
    }));
    setChatAttachments(prev => [...prev, ...newAtts]);
    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newAtts: ProjectAttachment[] = Array.from(files).map(f => ({
        id: `att_${Date.now()}_${Math.random()}`,
        fileName: f.name,
        fileSize: f.size,
        mimeType: f.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        uploadedBy: employee?.id || 'e1',
      }));
      setAttachments(prev => [...prev, ...newAtts]);
    }
  };

  const handleCreateProject = () => {
    if (!newProject.title || !newProject.startDate) {
      alert('Please fill all required fields: Title and Start Date');
      return;
    }
    if (!employee) return;
    const today = new Date().toISOString().split('T')[0];
    const allMembers = [
      { id: `pm_${Date.now()}_mgr`, employeeId: employee.id, role: 'manager' as const, joinedAt: today },
      ...newProject.memberIds.map((id, i) => ({
        id: `pm_${Date.now()}_${i}`, employeeId: id, role: 'developer' as const, joinedAt: today
      }))
    ];
    const project: Project = {
      id: `p_${Date.now()}`,
      projectId: `PRJ${String(projects.length + 1).padStart(3, '0')}`,
      title: newProject.title,
      description: newProject.description,
      technologyStack: newProject.technologyStack ? newProject.technologyStack.split(',').map(t => t.trim()) : [],
      projectManagerId: employee.id,
      members: allMembers,
      startDate: newProject.startDate,
      targetDeliveryDate: newProject.targetDeliveryDate || undefined,
      priority: newProject.priority,
      status: 'planning',
      milestones: [],
      estimatedHours: 0,
      actualHours: 0,
      progress: 0,
      attachments: attachments,
      createdAt: today,
      updatedAt: today,
    };
    addProject(project);
    
    // Notify assigned employees
    newProject.memberIds.forEach(empId => {
      addNotification({
        id: `notif_${Date.now()}_${empId}`,
        userId: allEmployees.find(e => e.id === empId)?.userId || '',
        type: 'project_update',
        title: 'New Project Assignment',
        message: `You have been assigned to "${newProject.title}"`,
        entityId: project.id,
        entityType: 'project',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    setShowCreateModal(false);
    setNewProject({ title: '', description: '', priority: 'medium', startDate: '', targetDeliveryDate: '', technologyStack: '', memberIds: [] });
    setAttachments([]);
  };

  const handleEditProject = () => {
    if (!editProject) return;
    updateProject(editProject.id, editProject);
    setShowEditModal(false);
    setEditProject(null);
    if (selectedProject?.id === editProject.id) {
      setSelectedProject(editProject);
    }
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;
    deleteProject(selectedProject.id);
    setShowDeleteConfirm(false);
    setSelectedProject(null);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedProject || !employee) return;
    const newMsg: ProjectMessage = {
      id: `msg_${Date.now()}`,
      projectId: selectedProject.id,
      senderId: employee.id,
      content: chatMessage,
      replyToId: replyTo || undefined,
      isPinned: false,
      mentions: [],
      attachments: chatAttachments,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    addMessage(newMsg);
    notificationSound.playMessageSound();

    // Notify all project members except sender
    selectedProject.members.forEach(m => {
      if (m.employeeId !== employee.id) {
        const emp = allEmployees.find(e => e.id === m.employeeId);
        if (emp) {
          addNotification({
            id: `notif_msg_${Date.now()}_${m.employeeId}`,
            userId: emp.userId,
            type: 'message',
            title: `New message in ${selectedProject.title}`,
            message: `${employee.firstName}: ${chatMessage.slice(0, 50)}${chatMessage.length > 50 ? '...' : ''}`,
            entityId: selectedProject.id,
            entityType: 'project',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    setChatMessage('');
    setReplyTo(null);
    setChatAttachments([]);
  };

  const handleCreateTask = () => {
    if (!newTask.title || !selectedProject || !employee) return;
    if (newTask.assigneeIds.length === 0) {
      alert('Please assign at least one team member');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const task: Task = {
      id: `t_${Date.now()}`,
      taskId: `TSK${String(tasks.length + 1).padStart(3, '0')}`,
      title: newTask.title,
      description: newTask.description,
      projectId: selectedProject.id,
      creatorId: employee.id,
      assigneeIds: newTask.assigneeIds,
      scheduledDate: today,
      createdAt: new Date().toISOString(),
      dueDate: newTask.dueDate || undefined,
      estimatedMinutes: newTask.estimatedHours * 60,
      actualMinutes: 0,
      priority: newTask.priority,
      status: 'planned',
      isOverdue: false,
      statusHistory: [{
        id: `sh_${Date.now()}`,
        fromStatus: null,
        toStatus: 'planned',
        changedBy: employee.id,
        changedAt: new Date().toISOString(),
      }],
      timeEntries: [],
    };
    addTask(task);
    notificationSound.playTaskSound();

    // Notify assigned employees
    newTask.assigneeIds.forEach(empId => {
      const emp = allEmployees.find(e => e.id === empId);
      if (emp) {
        addNotification({
          id: `notif_task_${Date.now()}_${empId}`,
          userId: emp.userId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `"${newTask.title}" in ${selectedProject.title}`,
          entityId: task.id,
          entityType: 'task',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Also notify admin
    addNotification({
      id: `notif_task_admin_${Date.now()}`,
      userId: 'u7',
      type: 'task_assigned',
      title: 'New Task Created',
      message: `"${newTask.title}" added to ${selectedProject.title}`,
      entityId: task.id,
      entityType: 'task',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setShowTaskModal(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', estimatedHours: 4, assigneeIds: [] });
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !employee || !selectedProject) return;

    const now = new Date().toISOString();
    const newHistory = [...task.statusHistory, {
      id: `sh_${Date.now()}`,
      fromStatus: task.status,
      toStatus: newStatus,
      changedBy: employee.id,
      changedAt: now,
    }];

    const updates: Partial<Task> = {
      status: newStatus,
      statusHistory: newHistory,
    };

    if (newStatus === 'completed') {
      updates.completedAt = now;
    }

    updateTask(taskId, updates);
    notificationSound.playStatusSound();

    // Notify all project members
    selectedProject.members.forEach(m => {
      if (m.employeeId !== employee.id) {
        const emp = allEmployees.find(e => e.id === m.employeeId);
        if (emp) {
          addNotification({
            id: `notif_status_${Date.now()}_${m.employeeId}`,
            userId: emp.userId,
            type: 'task_completed',
            title: 'Task Status Updated',
            message: `"${task.title}" is now ${newStatus.replace('_', ' ')} in ${selectedProject.title}`,
            entityId: task.id,
            entityType: 'task',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getEmployeeName = (id: string) => {
    const emp = allEmployees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">{filtered.length} projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Grid</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>List</button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Project</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="planning">Planning</option><option value="active">Active</option>
          <option value="on_hold">On Hold</option><option value="completed">Completed</option>
        </select>
      </div>

      {/* Project Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const pTasks = projectTasks(p.id);
            const completedTasks = pTasks.filter(t => t.status === 'completed').length;
            const pm = allEmployees.find(e => e.id === p.projectManagerId);
            return (
              <div key={p.id} onClick={() => { setSelectedProject(p); setActiveTab('overview'); }} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-mono">{p.projectId}</span>
                    <h3 className="font-semibold text-gray-900 mt-0.5">{p.title}</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <span className={`badge ${statusColors[p.status]}`}>{p.status.replace('_', ' ')}</span>
                    <span className={`badge ${priorityColors[p.priority]}`}>{p.priority}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${p.progress >= 75 ? 'bg-green-500' : p.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.members.length}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {p.startDate}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {projectMessages.filter(m => m.projectId === p.id).length}</span>
                  </div>
                  <span>{completedTasks}/{pTasks.length} tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Team</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Tasks</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Messages</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => { setSelectedProject(p); setActiveTab('overview'); }} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 px-4"><p className="font-medium text-gray-900">{p.title}</p></td>
                  <td className="py-3 px-4"><span className={`badge ${statusColors[p.status]}`}>{p.status.replace('_', ' ')}</span></td>
                  <td className="py-3 px-4">{p.members.length} members</td>
                  <td className="py-3 px-4">{projectTasks(p.id).length} tasks</td>
                  <td className="py-3 px-4">{projectMessages.filter(m => m.projectId === p.id).length} msgs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Detail View */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                <div>
                  <span className="text-xs text-gray-400 font-mono">{selectedProject.projectId}</span>
                  <h2 className="text-lg font-semibold">{selectedProject.title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditProject({...selectedProject}); setShowEditModal(true); }} className="btn-secondary text-xs flex items-center gap-1"><Edit2 className="w-3 h-3" /> Edit</button>
                <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-100 flex gap-4 flex-shrink-0">
              {(['overview', 'tasks', 'chat', 'team'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'chat' && <span className="ml-1 badge bg-indigo-100 text-indigo-700">{projectMsgs.length}</span>}
                  {tab === 'tasks' && <span className="ml-1 badge bg-indigo-100 text-indigo-700">{projectTasks(selectedProject.id).length}</span>}
                  {tab === 'team' && <span className="ml-1 badge bg-indigo-100 text-indigo-700">{selectedProject.members.length}</span>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge ${statusColors[selectedProject.status]}`}>{selectedProject.status.replace('_', ' ')}</span>
                    <span className={`badge ${priorityColors[selectedProject.priority]}`}>{selectedProject.priority} priority</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedProject.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Start Date</p><p className="text-sm font-medium">{selectedProject.startDate}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Delivery</p><p className="text-sm font-medium">{selectedProject.targetDeliveryDate || '—'}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Tasks</p><p className="text-sm font-medium">{projectTasks(selectedProject.id).length}</p></div>
                    <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Team</p><p className="text-sm font-medium">{selectedProject.members.length} members</p></div>
                  </div>
                  {selectedProject.attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Paperclip className="w-4 h-4" /> Attachments</h3>
                      <div className="space-y-2">
                        {selectedProject.attachments.map(att => (
                          <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-indigo-500" />
                              <div><p className="text-sm font-medium">{att.fileName}</p><p className="text-xs text-gray-500">{formatFileSize(att.fileSize)}</p></div>
                            </div>
                            <button className="p-2 hover:bg-gray-200 rounded-lg"><Download className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Tasks ({projectTasks(selectedProject.id).length})</h3>
                    <button onClick={() => setShowTaskModal(true)} className="btn-primary text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> Add Task</button>
                  </div>
                  {projectTasks(selectedProject.id).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No tasks yet. Click "Add Task" to create one.</p>
                  ) : (
                    <div className="space-y-2">
                      {projectTasks(selectedProject.id).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500' : t.status === 'in_progress' ? 'bg-blue-500' : t.isOverdue ? 'bg-red-500' : 'bg-gray-400'}`} />
                            <div>
                              <p className="text-sm font-medium">{t.title}</p>
                              <p className="text-xs text-gray-500">Assigned: {t.assigneeIds.map(id => getEmployeeName(id)).join(', ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select value={t.status} onChange={e => handleTaskStatusChange(t.id, e.target.value as Task['status'])} className="text-xs border border-gray-200 rounded px-2 py-1">
                              <option value="planned">Planned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="on_hold">On Hold</option>
                            </select>
                            <span className={`badge ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                              {(t.actualMinutes / 60).toFixed(1)}h / {(t.estimatedMinutes / 60).toFixed(1)}h
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {projectMsgs.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
                    ) : projectMsgs.map(msg => {
                      const sender = allEmployees.find(e => e.id === msg.senderId);
                      const isCurrentUser = msg.senderId === employee?.id;
                      const repliedMsg = msg.replyToId ? projectMsgs.find(m => m.id === msg.replyToId) : null;
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {sender?.firstName?.[0]}{sender?.lastName?.[0]}
                          </div>
                          <div className={`max-w-[70%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">{sender?.firstName} {sender?.lastName}</span>
                              <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {repliedMsg && (
                              <div className="mb-1 px-3 py-1.5 bg-gray-50 rounded-lg border-l-2 border-indigo-300 text-xs text-gray-500">
                                <span className="font-medium">{getEmployeeName(repliedMsg.senderId)}:</span> {repliedMsg.content.slice(0, 60)}...
                              </div>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${isCurrentUser ? 'bg-indigo-600 text-white rounded-tr-md' : 'bg-gray-100 text-gray-800 rounded-tl-md'}`}>
                              {msg.content}
                            </div>
                            {msg.attachments.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {msg.attachments.map(att => (
                                  <div key={att.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded text-xs">
                                    <FileText className="w-3 h-3 text-indigo-500" />
                                    <span>{att.fileName}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button onClick={() => setReplyTo(msg.id)} className="mt-1 text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1">
                              <Send className="w-3 h-3" /> Reply
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {replyTo && (
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Replying to {getEmployeeName(projectMsgs.find(m => m.id === replyTo)?.senderId || '')}</span>
                      <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    {chatAttachments.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {chatAttachments.map(att => (
                          <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {att.fileName}</span>
                            <button onClick={() => setChatAttachments(prev => prev.filter(a => a.id !== att.id))} className="text-red-500">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input type="file" ref={chatFileInputRef} onChange={handleChatFileUpload} multiple className="hidden" />
                      <button onClick={() => chatFileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-lg"><Paperclip className="w-4 h-4 text-gray-500" /></button>
                      <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="input-field flex-1" />
                      <button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Team Members ({selectedProject.members.length})</h3>
                    <button onClick={() => setShowTeamModal(true)} className="btn-primary text-xs flex items-center gap-1"><UserPlus className="w-3 h-3" /> Add Member</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.members.map(m => {
                      const emp = allEmployees.find(e => e.id === m.employeeId);
                      const isManager = m.role === 'manager';
                      return (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                              {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{emp?.firstName} {emp?.lastName}</p>
                              <p className="text-xs text-gray-500">{isManager ? 'Project Manager' : m.role}</p>
                            </div>
                          </div>
                          {!isManager && (
                            <button onClick={() => removeProjectMember(selectedProject.id, m.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Remove member">
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label><input className="input-field" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="Enter project title" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea className="input-field" rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Project description" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="date" className="input-field" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date (Optional)</label><input type="date" className="input-field" value={newProject.targetDeliveryDate} onChange={e => setNewProject({...newProject, targetDeliveryDate: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="input-field" value={newProject.priority} onChange={e => setNewProject({...newProject, priority: e.target.value as any})}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign Team Members</label>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {allEmployees.filter(e => e.id !== employee?.id && e.status === 'active').map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={newProject.memberIds.includes(emp.id)} onChange={() => setNewProject(prev => ({...prev, memberIds: prev.memberIds.includes(emp.id) ? prev.memberIds.filter(id => id !== emp.id) : [...prev.memberIds, emp.id]}))} className="rounded text-indigo-600" />
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{emp.firstName[0]}{emp.lastName[0]}</div>
                      <div className="flex-1"><p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p><p className="text-xs text-gray-500">{emp.designation}</p></div>
                    </label>
                  ))}
                </div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Project Materials</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{isDragging ? 'Drop files here...' : 'Click to upload or drag and drop'}</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">Browse Files</button>
                </div>
                {attachments.length > 0 && <div className="mt-3 space-y-2">{attachments.map(att => (<div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded"><span className="text-sm">{att.fileName}</span><button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="text-red-500 text-xs">Remove</button></div>))}</div>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreateProject} className="btn-primary flex-1">Create Project</button>
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Project</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input className="input-field" value={editProject.title} onChange={e => setEditProject({...editProject, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea className="input-field" rows={3} value={editProject.description} onChange={e => setEditProject({...editProject, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input-field" value={editProject.status} onChange={e => setEditProject({...editProject, status: e.target.value as ProjectStatus})}>
                    <option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={editProject.priority} onChange={e => setEditProject({...editProject, priority: e.target.value as any})}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Target Delivery</label><input type="date" className="input-field" value={editProject.targetDeliveryDate || ''} onChange={e => setEditProject({...editProject, targetDeliveryDate: e.target.value || undefined})} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditProject} className="btn-primary flex-1">Save Changes</button>
                <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-600" /></div>
                <div><h3 className="text-lg font-semibold">Delete Project</h3><p className="text-sm text-gray-500">This will permanently delete the project and all related data.</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDeleteProject} className="btn-danger flex-1">Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTaskModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Task to {selectedProject?.title}</h2>
              <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label><input className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Enter task title" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea className="input-field" rows={2} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input type="date" className="input-field" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label><input type="number" className="input-field" value={newTask.estimatedHours} onChange={e => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                  {selectedProject?.members.filter(m => m.role !== 'manager').map(m => {
                    const emp = allEmployees.find(e => e.id === m.employeeId);
                    return (
                      <label key={m.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input type="checkbox" checked={newTask.assigneeIds.includes(m.employeeId)} onChange={() => setNewTask(prev => ({...prev, assigneeIds: prev.assigneeIds.includes(m.employeeId) ? prev.assigneeIds.filter(id => id !== m.employeeId) : [...prev.assigneeIds, m.employeeId]}))} className="rounded text-indigo-600" />
                        <span className="text-sm">{emp?.firstName} {emp?.lastName}</span>
                      </label>
                    );
                  })}
                </div></div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreateTask} className="btn-primary flex-1">Create Task</button>
                <button onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showTeamModal && selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTeamModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Team Member</h2>
              <button onClick={() => setShowTeamModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {allEmployees.filter(e => e.status === 'active' && !selectedProject.members.some(m => m.employeeId === e.id)).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{emp.firstName[0]}{emp.lastName[0]}</div>
                      <div><p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p><p className="text-xs text-gray-500">{emp.designation}</p></div>
                    </div>
                    <button onClick={() => { addProjectMember(selectedProject.id, emp.id, 'developer'); setShowTeamModal(false); }} className="btn-primary text-xs">Add</button>
                  </div>
                ))}
                {allEmployees.filter(e => e.status === 'active' && !selectedProject.members.some(m => m.employeeId === e.id)).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">All employees are already team members</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
