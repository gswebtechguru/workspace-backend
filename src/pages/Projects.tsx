import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { employees } from '../data/mockData';
import { Search, Plus, Users, Calendar, X, Target, Upload, Paperclip, FileText, Download } from 'lucide-react';
import { Project, ProjectStatus, ProjectAttachment } from '../types';

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
  const { projects, tasks, addProject, employees: allEmployees } = useData();
  const { employee } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    startDate: '', targetDeliveryDate: '', projectManagerId: '', technologyStack: '',
    memberIds: [] as string[]
  });
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const projectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);

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

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const toggleMember = (empId: string) => {
    setNewProject(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(empId)
        ? prev.memberIds.filter(id => id !== empId)
        : [...prev.memberIds, empId]
    }));
  };

  const handleCreateProject = () => {
    if (!newProject.title || !newProject.startDate || !newProject.projectManagerId) {
      alert('Please fill all required fields: Title, Start Date, and Project Manager');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const allMembers = [
      { id: `pm_${Date.now()}_mgr`, employeeId: newProject.projectManagerId, role: 'manager' as const, joinedAt: today },
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
      projectManagerId: newProject.projectManagerId,
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
    setShowCreateModal(false);
    setNewProject({ title: '', description: '', priority: 'medium', startDate: '', targetDeliveryDate: '', projectManagerId: '', technologyStack: '', memberIds: [] });
    setAttachments([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
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

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const pTasks = projectTasks(p.id);
            const completedTasks = pTasks.filter(t => t.status === 'completed').length;
            const overdueTasks = pTasks.filter(t => t.isOverdue && t.status !== 'completed').length;
            const pm = allEmployees.find(e => e.id === p.projectManagerId);
            return (
              <div key={p.id} onClick={() => setSelectedProject(p)} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
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
                    <div className={`h-full rounded-full transition-all ${p.progress >= 75 ? 'bg-green-500' : p.progress >= 50 ? 'bg-blue-500' : p.progress >= 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.members.length}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Start: {p.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.attachments.length > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {p.attachments.length}</span>}
                    {overdueTasks > 0 && <span className="text-red-600 font-medium">{overdueTasks} overdue</span>}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {pm?.firstName?.[0]}{pm?.lastName?.[0]}
                  </div>
                  <span className="text-xs text-gray-500">PM: {pm?.firstName} {pm?.lastName}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No projects found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Start</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Delivery</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Team</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Files</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} onClick={() => setSelectedProject(p)} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-4"><p className="font-medium text-gray-900">{p.title}</p><p className="text-xs text-gray-400">{p.projectId}</p></td>
                      <td className="py-3 px-4"><span className={`badge ${statusColors[p.status]}`}>{p.status.replace('_', ' ')}</span></td>
                      <td className="py-3 px-4 text-gray-600">{p.startDate}</td>
                      <td className="py-3 px-4 text-gray-600">{p.targetDeliveryDate || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{p.members.length} members</td>
                      <td className="py-3 px-4 text-gray-600">{p.attachments.length} files</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs text-gray-400 font-mono">{selectedProject.projectId}</span>
                <h2 className="text-lg font-semibold">{selectedProject.title}</h2>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className={`badge ${statusColors[selectedProject.status]}`}>{selectedProject.status.replace('_', ' ')}</span>
                <span className={`badge ${priorityColors[selectedProject.priority]}`}>{selectedProject.priority} priority</span>
                {selectedProject.clientReference && <span className="badge bg-purple-100 text-purple-700">Client: {selectedProject.clientReference}</span>}
              </div>
              <p className="text-sm text-gray-600">{selectedProject.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Start Date</p><p className="text-sm font-medium">{selectedProject.startDate}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Target Delivery</p><p className="text-sm font-medium">{selectedProject.targetDeliveryDate || '—'}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Estimated Hours</p><p className="text-sm font-medium">{selectedProject.estimatedHours}h</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Actual Hours</p><p className="text-sm font-medium">{selectedProject.actualHours}h</p></div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Team Members ({selectedProject.members.length})</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProject.members.map(m => {
                    const emp = allEmployees.find(e => e.id === m.employeeId);
                    return (
                      <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{emp?.firstName} {emp?.lastName}</p>
                          <p className="text-xs text-gray-500">{m.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Paperclip className="w-4 h-4" /> Project Materials ({selectedProject.attachments.length})</h3>
                {selectedProject.attachments.length === 0 ? (
                  <p className="text-sm text-gray-500">No attachments</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{att.fileName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(att.fileSize)} • {att.uploadedAt}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-200 rounded-lg"><Download className="w-4 h-4 text-gray-600" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Milestones */}
              {selectedProject.milestones.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Target className="w-4 h-4" /> Milestones</h3>
                  <div className="space-y-2">
                    {selectedProject.milestones.map(ms => (
                      <div key={ms.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${ms.status === 'completed' ? 'bg-green-500' : ms.status === 'in_progress' ? 'bg-blue-500' : ms.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{ms.title}</p>
                          <p className="text-xs text-gray-500">Due: {ms.dueDate}</p>
                        </div>
                        <span className={`badge ${ms.status === 'completed' ? 'bg-green-100 text-green-700' : ms.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{ms.status.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Tasks */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks ({projectTasks(selectedProject.id).length})</h3>
                <div className="space-y-2">
                  {projectTasks(selectedProject.id).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
                  ) : projectTasks(selectedProject.id).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500' : t.status === 'in_progress' ? 'bg-blue-500' : t.isOverdue ? 'bg-red-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium">{t.title}</p>
                          <p className="text-xs text-gray-500">Assigned to: {t.assigneeIds.map(id => { const e = allEmployees.find(emp => emp.id === id); return e ? `${e.firstName} ${e.lastName}` : 'Unknown'; }).join(', ')}</p>
                        </div>
                      </div>
                      <span className={`badge ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : t.isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {t.isOverdue && t.status !== 'completed' ? 'Overdue' : t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input className="input-field" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="Enter project title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Project description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" className="input-field" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Delivery Date (Optional)</label>
                  <input type="date" className="input-field" value={newProject.targetDeliveryDate} onChange={e => setNewProject({...newProject, targetDeliveryDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={newProject.priority} onChange={e => setNewProject({...newProject, priority: e.target.value as any})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
                  <select className="input-field" value={newProject.projectManagerId} onChange={e => setNewProject({...newProject, projectManagerId: e.target.value})}>
                    <option value="">Select manager</option>
                    {allEmployees.filter(e => e.role === 'admin').map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technology Stack</label>
                <input className="input-field" value={newProject.technologyStack} onChange={e => setNewProject({...newProject, technologyStack: e.target.value})} placeholder="React, Laravel, MySQL (comma separated)" />
              </div>

              {/* Assign Multiple Employees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Team Members</label>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {allEmployees.filter(e => e.id !== newProject.projectManagerId && e.status === 'active').map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={newProject.memberIds.includes(emp.id)} onChange={() => toggleMember(emp.id)} className="rounded text-indigo-600" />
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.designation}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {newProject.memberIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">{newProject.memberIds.length} member{newProject.memberIds.length > 1 ? 's' : ''} selected</p>
                )}
              </div>

              {/* Upload Project Materials */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Materials</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, Images, ZIP (max 10MB each)</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    Browse Files
                  </button>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <div>
                            <p className="text-sm text-gray-900">{att.fileName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(att.fileSize)}</p>
                          </div>
                        </div>
                        <button onClick={() => removeAttachment(att.id)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleCreateProject} className="btn-primary flex-1">Create Project</button>
                <button onClick={() => { setShowCreateModal(false); setAttachments([]); }} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
