import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { projects, getEmployeeName } from '../data/mockData';
import { Send, Paperclip, Pin, Search, Reply, MoreHorizontal, Image, AtSign } from 'lucide-react';
import { ProjectMessage } from '../types';

export default function Chat() {
  const { projectMessages, addMessage } = useData();
  const { employee } = useAuth();
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const projectMsgs = projectMessages.filter(m => m.projectId === selectedProject.id && !m.isDeleted);
  const pinnedMsgs = projectMsgs.filter(m => m.isPinned);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [projectMsgs.length, selectedProject.id]);

  const handleSend = () => {
    if (!message.trim() || !employee) return;
    const mentions: string[] = [];
    const mentionRegex = /@(\w+\s\w+)/g;
    let matchResult: RegExpExecArray | null;
    while ((matchResult = mentionRegex.exec(message)) !== null) {
      const mentioned = projects.flatMap(p => p.members).find(m => {
        const emp = getEmployeeName(m.employeeId);
        return emp === matchResult![1];
      });
      if (mentioned) mentions.push(mentioned.employeeId);
    }

    const newMsg: ProjectMessage = {
      id: `msg_${Date.now()}`,
      projectId: selectedProject.id,
      senderId: employee.id,
      content: message,
      replyToId: replyTo || undefined,
      isPinned: false,
      mentions,
      attachments: [],
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    addMessage(newMsg);
    setMessage('');
    setReplyTo(null);
  };

  const replyMsg = replyTo ? projectMsgs.find(m => m.id === replyTo) : null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Project Sidebar */}
      <div className="w-64 flex-shrink-0 card overflow-hidden hidden md:flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Project Channels</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.filter(p => p.status === 'active' || p.status === 'on_hold').map(p => (
            <button key={p.id} onClick={() => setSelectedProject(p)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedProject.id === p.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                <span className="truncate">{p.title}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 ml-4">{p.members.length} members</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">{selectedProject.title}</h3>
            <p className="text-xs text-gray-500">{selectedProject.members.length} members • {projectMsgs.length} messages</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Search className="w-4 h-4 text-gray-500" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreHorizontal className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>

        {/* Pinned Messages */}
        {pinnedMsgs.length > 0 && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <Pin className="w-3 h-3" />
              <span className="font-medium">{pinnedMsgs.length} pinned message{pinnedMsgs.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {projectMsgs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : projectMsgs.map(msg => {
            const sender = getEmployeeName(msg.senderId);
            const senderInitials = sender.split(' ').map(n => n[0]).join('');
            const isCurrentUser = msg.senderId === employee?.id;
            const repliedMsg = msg.replyToId ? projectMsgs.find(m => m.id === msg.replyToId) : null;
            return (
              <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {senderInitials}
                </div>
                <div className={`max-w-[70%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">{sender}</span>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
                  </div>
                  {repliedMsg && (
                    <div className="mb-1 px-3 py-1.5 bg-gray-50 rounded-lg border-l-2 border-indigo-300 text-xs text-gray-500 max-w-full">
                      <span className="font-medium">{getEmployeeName(repliedMsg.senderId)}:</span> {repliedMsg.content.slice(0, 60)}{repliedMsg.content.length > 60 ? '...' : ''}
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${isCurrentUser ? 'bg-indigo-600 text-white rounded-tr-md' : 'bg-gray-100 text-gray-800 rounded-tl-md'}`}>
                    {msg.content}
                  </div>
                  <button onClick={() => setReplyTo(msg.id)} className="mt-1 text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1">
                    <Reply className="w-3 h-3" /> Reply
                  </button>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyMsg && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Reply className="w-3 h-3" />
              <span>Replying to <span className="font-medium">{getEmployeeName(replyMsg.senderId)}</span></span>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          </div>
        )}

        {/* Message Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block"><Paperclip className="w-4 h-4 text-gray-500" /></button>
            <button className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block"><Image className="w-4 h-4 text-gray-500" /></button>
            <div className="flex-1 relative">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message... Use @name to mention" className="input-field pr-10" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <AtSign className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleSend} disabled={!message.trim()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
