import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { projects, employees, tasks, getEmployeeName } from '../data/mockData';
import { Search, Plus, Filter, Calendar, Users, Clock, ArrowRight, ChevronRight, X, Flag, Target } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const projectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);

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
          <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Project</button>
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
            const overdueTasks = pTasks.filter(t => t.isOverdue).length;
            const pm = employees.find(e => e.id === p.projectManagerId);
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
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {p.targetDeliveryDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {overdueTasks > 0 && <span className="text-red-600 font-medium">{overdueTasks} overdue</span>}
                    <span>{completedTasks}/{pTasks.length} tasks</span>
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
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Team</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => setSelectedProject(p)} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 px-4"><p className="font-medium text-gray-900">{p.title}</p><p className="text-xs text-gray-400">{p.projectId}</p></td>
                  <td className="py-3 px-4"><span className={`badge ${statusColors[p.status]}`}>{p.status.replace('_', ' ')}</span></td>
                  <td className="py-3 px-4"><span className={`badge ${priorityColors[p.priority]}`}>{p.priority}</span></td>
                  <td className="py-3 px-4"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} /></div><span className="text-xs">{p.progress}%</span></div></td>
                  <td className="py-3 px-4 text-gray-600">{p.targetDeliveryDate}</td>
                  <td className="py-3 px-4 text-gray-600">{p.members.length} members</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Target Delivery</p><p className="text-sm font-medium">{selectedProject.targetDeliveryDate}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Estimated Hours</p><p className="text-sm font-medium">{selectedProject.estimatedHours}h</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Actual Hours</p><p className="text-sm font-medium">{selectedProject.actualHours}h</p></div>
              </div>

              {/* Milestones */}
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

              {/* Team Members */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Team Members</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProject.members.map(m => {
                    const emp = employees.find(e => e.id === m.employeeId);
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

              {/* Project Tasks */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tasks ({projectTasks(selectedProject.id).length})</h3>
                <div className="space-y-2">
                  {projectTasks(selectedProject.id).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500' : t.status === 'in_progress' ? 'bg-blue-500' : t.isOverdue ? 'bg-red-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium">{t.title}</p>
                          <p className="text-xs text-gray-500">Assigned to: {t.assigneeIds.map(id => getEmployeeName(id)).join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : t.isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {t.isOverdue && t.status !== 'completed' ? 'Overdue' : t.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
