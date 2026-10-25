import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  List, 
  LayoutGrid, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  Circle,
  Square,
  X,
  Clock,
  User,
  Tag,
  Paperclip,
  CheckCircle2,
  Send,
  MessageSquare,
  Trash2
} from './ui/FormativeGlyphs';
import { IssueItem, OfficeMemberProfile, ThemeMode, Project } from '../types';
import type { AgentRun } from '../types/agentRuns';

interface IssuesViewProps {
  theme: ThemeMode;
  activeProject?: Project | null;
  officeEmployees?: OfficeMemberProfile[];
  onUpdateProjectIssues?: (issues: IssueItem[], nextTaskNumber?: number) => void;
  onOpenNewIssue?: () => void;
  onOpenAgentChat?: (taskId: string) => void;
}

const ACTIVE_RUN_STATUSES = new Set<AgentRun['status']>(['queued', 'starting', 'running', 'waiting_for_approval', 'stopping']);
const RUN_PROGRESS_TYPES = new Set(['progress', 'tool_started', 'tool_finished', 'file_changed', 'approval_required', 'warning', 'error']);
const PROVIDER_LABELS: Record<string, string> = { 'codex-cli': 'Codex', 'claude-code': 'Claude Code' };

export const IssuesView: React.FC<IssuesViewProps> = ({ 
  theme, 
  activeProject,
  officeEmployees = [],
  onUpdateProjectIssues,
  onOpenNewIssue,
  onOpenAgentChat,
}) => {
  const [issues, setIssues] = useState<IssueItem[]>(() => {
    return activeProject?.issues || [];
  });

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(() => {
    return activeProject?.issues?.[0]?.id || null;
  });

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState<'todo' | 'in_progress' | 'blocked' | 'done'>('todo');

  const isDark = theme !== 'light';

  // Sync when project changes
  useEffect(() => {
    const list = activeProject?.issues || [];
    setIssues(list);
    if (list.length > 0) {
      if (!selectedIssueId || !list.some(i => i.id === selectedIssueId)) {
        setSelectedIssueId(list[0].id);
      }
    } else {
      setSelectedIssueId(null);
    }
  }, [activeProject]);

  const updateIssuesList = (updated: IssueItem[], nextTaskNumber?: number) => {
    setIssues(updated);
    if (onUpdateProjectIssues) {
      onUpdateProjectIssues(updated, nextTaskNumber);
    }
  };

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);
  const linkedTaskRuns = selectedIssue && activeProject
    ? [...(activeProject.agentRuns || [])]
        .filter((run) => run.taskId === selectedIssue.id || (activeProject.agentConversations || []).some((conversation) => conversation.id === run.conversationId && conversation.taskId === selectedIssue.id))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const selectedTaskRun = linkedTaskRuns.find((run) => ACTIVE_RUN_STATUSES.has(run.status)) || linkedTaskRuns[0];
  const selectedTaskRunEvent = selectedTaskRun
    ? [...selectedTaskRun.events].reverse().find((event) => RUN_PROGRESS_TYPES.has(event.type))
    : undefined;
  const selectedTaskRunEmployee = selectedTaskRun?.employeeId
    ? officeEmployees.find((employee) => employee.id === selectedTaskRun.employeeId)
    : undefined;
  const selectedIssueEmployee = selectedIssue?.assignedEmployeeId
    ? officeEmployees.find((employee) => employee.id === selectedIssue.assignedEmployeeId)
    : undefined;

  const toggleGroup = (grp: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [grp]: !prev[grp] }));
  };

  const handleDeleteIssue = (id: string) => {
    const issueToDelete = issues.find((issue) => issue.id === id);
    if (!issueToDelete || !window.confirm(`Delete ${issueToDelete.key}: “${issueToDelete.title}”? This cannot be undone.`)) return;
    const updated = issues.filter(i => i.id !== id);
    updateIssuesList(updated);
    if (selectedIssueId === id) {
      setSelectedIssueId(updated[0]?.id || null);
    }
  };

  const handleStatusChange = (newStat: 'in_progress' | 'todo' | 'blocked' | 'done') => {
    if (!selectedIssueId) return;
    const updated = issues.map((item) => {
      if (item.id === selectedIssueId) {
        return {
          ...item,
          status: newStat,
        };
      }
      return item;
    });
    updateIssuesList(updated);
  };

  const handleAssigneeChange = (employeeId: string) => {
    if (!selectedIssueId) return;
    const employee = officeEmployees.find((item) => item.id === employeeId && item.enabled);
    const initials = employee?.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
    updateIssuesList(issues.map((item) => item.id === selectedIssueId
      ? {
          ...item,
          ...(employee ? { assignedEmployeeId: employee.id } : { assignedEmployeeId: undefined }),
          assignee: employee?.name || 'Unassigned',
          assigneeInitials: initials,
        }
      : item
    ));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedIssueId) return;

    const newComment = {
      author: 'You (Operator)',
      date: new Date().toLocaleString(),
      content: newCommentText.trim()
    };

    const updated = issues.map((item) => {
      if (item.id === selectedIssueId) {
        return {
          ...item,
          comments: [...(item.comments || []), newComment]
        };
      }
      return item;
    });

    updateIssuesList(updated);
    setNewCommentText('');
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const highestTaskNumber = issues.reduce((highest, issue) => {
      const match = issue.key.match(/^TASK-(\d+)$/i);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, Math.max(0, (activeProject?.nextTaskNumber || 1) - 1));
    const nextTaskNumber = highestTaskNumber + 1;
    const newKey = `TASK-${nextTaskNumber}`;
    const newIssue: IssueItem = {
      id: `task-${globalThis.crypto.randomUUID()}`,
      key: newKey,
      title: newTitle.trim(),
      status: newStatus,
      assignee: 'Unassigned',
      assigneeInitials: 'U',
      projectName: activeProject?.name || 'Project',
      projectColor: '#3b82f6',
      date: new Date().toLocaleDateString(),
      description: '',
      comments: []
    };

    const updated = [newIssue, ...issues];
    updateIssuesList(updated, nextTaskNumber + 1);
    setSelectedIssueId(newIssue.id);
    setNewTitle('');
    setIsCreatingIssue(false);
  };

  const inProgressList = issues.filter((i) => i.status === 'in_progress');
  const todoList = issues.filter((i) => i.status === 'todo');
  const blockedList = issues.filter((i) => i.status === 'blocked');
  const doneList = issues.filter((i) => i.status === 'done');

  return (
    <div className={`flex flex-1 h-full overflow-hidden ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      {/* 1. Main Issues List Column */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden border-r ${
        isDark ? 'border-[#27272a]' : 'border-zinc-200'
      }`}>
        {/* Issues List Header */}
        <div className={`h-12 px-5 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'border-[#27272a] bg-[#0c0c0e]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">
              Tasks & Issues
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-200 border-zinc-300 text-zinc-700'
            }`}>
              {issues.length} Total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingIssue(!isCreatingIssue)}
              className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Create Task Inline Form */}
        {isCreatingIssue && (
          <form onSubmit={handleCreateIssue} className={`p-4 border-b space-y-3 ${
            isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-900'}`}>New task</span>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Tasks are saved to this project. They do not start an agent run.</p>
              </div>
              <button type="button" onClick={() => setIsCreatingIssue(false)} className={`transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              id="new-task-title"
              type="text"
              aria-label="Task title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Implement user login flow with JWT validation"
              autoFocus
              className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none ${
                isDark ? 'bg-[#18181c] border-[#27272a] text-white focus:border-white' : 'bg-white border-zinc-300 text-black focus:border-black'
              }`}
            />
            <div className="flex items-center gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                aria-label="Initial task status"
                className={`px-3 py-1.5 rounded-lg border text-xs ${
                  isDark ? 'bg-[#18181c] border-[#27272a] text-zinc-200' : 'bg-white border-zinc-300 text-zinc-800'
                }`}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-40 text-xs font-semibold shadow-sm ml-auto"
              >
                Add Task
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Grouped Issues List */}
        {issues.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
            }`}>
              <List className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">No tasks created yet</p>
              <p className="text-xs text-zinc-400 max-w-xs mt-1">
                Create project tasks, assign a teammate, and start a linked read-only run in Agent Chat.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingIssue(true)}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
            >
              + Create First Task
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Group 1: IN PROGRESS */}
          {inProgressList.length > 0 && (
            <div className="space-y-1.5">
              <button
                onClick={() => toggleGroup('in_progress')}
                aria-expanded={!collapsedGroups.in_progress}
                className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                {collapsedGroups.in_progress ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>In Progress ({inProgressList.length})</span>
              </button>

              {!collapsedGroups.in_progress && (
                <div className="space-y-1">
                  {inProgressList.map((item) => {
                    const isSelected = selectedIssueId === item.id;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`Select task ${item.key}: ${item.title}`}
                        onClick={() => setSelectedIssueId(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.currentTarget.click();
                          }
                        }}
                        className={`group px-3.5 py-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isSelected
                            ? isDark
                              ? 'bg-[#18181c] border-zinc-500 shadow-md ring-1 ring-zinc-500/40'
                              : 'bg-zinc-100 border-zinc-800 shadow-sm ring-1 ring-zinc-800/40'
                            : isDark
                            ? 'bg-[#121215] border-[#27272a] hover:border-zinc-700 hover:bg-[#18181c]'
                            : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 shrink-0" />
                          <span className={`text-xs font-mono shrink-0 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.key}</span>
                          <span className="text-sm font-semibold truncate group-hover:underline">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs hidden sm:inline ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.assignee}</span>
                          <span className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Group 2: TODO */}
          {todoList.length > 0 && (
            <div className="space-y-1.5">
              <button
                onClick={() => toggleGroup('todo')}
                aria-expanded={!collapsedGroups.todo}
                className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                {collapsedGroups.todo ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>To Do ({todoList.length})</span>
              </button>

              {!collapsedGroups.todo && (
                <div className="space-y-1">
                  {todoList.map((item) => {
                    const isSelected = selectedIssueId === item.id;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`Select task ${item.key}: ${item.title}`}
                        onClick={() => setSelectedIssueId(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.currentTarget.click();
                          }
                        }}
                        className={`group px-3.5 py-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isSelected
                            ? isDark
                              ? 'bg-[#18181c] border-zinc-500 shadow-md ring-1 ring-zinc-500/40'
                              : 'bg-zinc-100 border-zinc-800 shadow-sm ring-1 ring-zinc-800/40'
                            : isDark
                            ? 'bg-[#121215] border-[#27272a] hover:border-zinc-700 hover:bg-[#18181c]'
                            : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Circle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className={`text-xs font-mono shrink-0 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.key}</span>
                          <span className="text-sm font-semibold truncate group-hover:underline">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs hidden sm:inline ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.assignee}</span>
                          <span className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Group 3: BLOCKED */}
          {blockedList.length > 0 && (
            <div className="space-y-1.5">
              <button
                onClick={() => toggleGroup('blocked')}
                aria-expanded={!collapsedGroups.blocked}
                className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                {collapsedGroups.blocked ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>Blocked ({blockedList.length})</span>
              </button>

              {!collapsedGroups.blocked && (
                <div className="space-y-1">
                  {blockedList.map((item) => {
                    const isSelected = selectedIssueId === item.id;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`Select task ${item.key}: ${item.title}`}
                        onClick={() => setSelectedIssueId(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.currentTarget.click();
                          }
                        }}
                        className={`group px-3.5 py-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isSelected
                            ? isDark
                              ? 'bg-[#18181c] border-zinc-500 shadow-md ring-1 ring-zinc-500/40'
                              : 'bg-zinc-100 border-zinc-800 shadow-sm ring-1 ring-zinc-800/40'
                            : isDark
                            ? 'bg-[#121215] border-[#27272a] hover:border-zinc-700 hover:bg-[#18181c]'
                            : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Circle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className={`text-xs font-mono shrink-0 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.key}</span>
                          <span className="text-sm font-semibold truncate group-hover:underline">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs hidden sm:inline ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.assignee}</span>
                          <span className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Group 4: DONE */}
          {doneList.length > 0 && (
            <div className="space-y-1.5">
              <button
                onClick={() => toggleGroup('done')}
                aria-expanded={!collapsedGroups.done}
                className={`flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                {collapsedGroups.done ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>Completed ({doneList.length})</span>
              </button>

              {!collapsedGroups.done && (
                <div className="space-y-1">
                  {doneList.map((item) => {
                    const isSelected = selectedIssueId === item.id;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                        aria-label={`Select task ${item.key}: ${item.title}`}
                        onClick={() => setSelectedIssueId(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.currentTarget.click();
                          }
                        }}
                        className={`group px-3.5 py-3 rounded-xl border flex items-center justify-between cursor-pointer opacity-70 hover:opacity-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isSelected
                            ? isDark
                              ? 'bg-[#18181c] border-zinc-500 ring-1 ring-zinc-500/40'
                              : 'bg-zinc-100 border-zinc-800 ring-1 ring-zinc-800/40'
                            : isDark
                            ? 'bg-[#121215] border-[#27272a]'
                            : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className={`text-xs font-mono shrink-0 font-medium line-through ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.key}</span>
                          <span className="text-sm font-semibold truncate line-through">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs hidden sm:inline ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.assignee}</span>
                          <span className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* 2. Detail Pane on the Right */}
      {selectedIssue && (
        <div className={`w-[480px] h-full flex flex-col overflow-y-auto ${
          isDark ? 'bg-[#09090b]' : 'bg-white'
        }`}>
          {/* Top Detail Header */}
          <div className={`p-5 border-b space-y-3 shrink-0 ${
            isDark ? 'border-[#27272a]' : 'border-zinc-200'
          }`}>
            <div className={`flex items-center justify-between text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <div className="flex items-center gap-2">
                <span>{selectedIssue.key}</span>
                <span>•</span>
                <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{selectedIssue.projectName}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Dropdown */}
                <select
                  value={selectedIssue.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  aria-label={`Status for ${selectedIssue.key}`}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold focus:outline-none ${
                    selectedIssue.status === 'in_progress'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : selectedIssue.status === 'done'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : selectedIssue.status === 'blocked'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                  }`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>

                {/* Delete Task Button */}
                <button
                  onClick={() => handleDeleteIssue(selectedIssue.id)}
                  title="Delete Task"
                  aria-label={`Delete ${selectedIssue.key}`}
                  className={`p-1 rounded-md border transition-colors ${
                    isDark ? 'border-zinc-700 hover:border-red-500 hover:text-red-400 text-zinc-400' : 'border-zinc-200 hover:border-red-500 hover:text-red-500 text-zinc-500'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold leading-snug">
              {selectedIssue.title}
            </h3>

            {/* Description */}
            <p className={`text-xs leading-relaxed whitespace-pre-line ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {selectedIssue.description || 'No description provided.'}
            </p>
          </div>

          <div className={`p-5 border-b space-y-3 ${isDark ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
            {selectedTaskRun ? (
              <div className={`rounded-xl border p-4 ${isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Latest agent run{linkedTaskRuns.length > 1 ? ` · ${linkedTaskRuns.length} linked` : ''}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${selectedTaskRun.status === 'failed' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300' : selectedTaskRun.status === 'completed' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : selectedTaskRun.status === 'waiting_for_approval' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                    {selectedTaskRun.status.replaceAll('_', ' ')}
                  </span>
                </div>
                <p className={`mt-2 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {PROVIDER_LABELS[selectedTaskRun.providerId] || selectedTaskRun.providerId}
                  {selectedTaskRunEmployee ? ` · ${selectedTaskRunEmployee.name}` : selectedTaskRun.employeeId ? ' · Assigned teammate is no longer in this team' : ''}
                </p>
                <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                  {selectedTaskRunEvent?.summary || (selectedTaskRun.status === 'running' ? 'The provider is running; no progress event has arrived yet.' : `Run ${selectedTaskRun.status.replaceAll('_', ' ')}.`)}
                </p>
                {selectedTaskRunEvent?.relativePaths?.length ? <p className={`mt-1 break-words font-mono text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{selectedTaskRunEvent.relativePaths.join(' · ')}</p> : null}
              </div>
            ) : (
              <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'}`}>
                <div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-900'}`}>No agent run is linked to this task yet.</p>
                  <p className={`mt-1 max-w-lg text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Open Agent Chat and select this task. Formative will select its assigned teammate when that person is enabled.</p>
                </div>
                <button type="button" onClick={() => onOpenAgentChat?.(selectedIssue.id)} className={`h-8 shrink-0 rounded-md border px-3 text-xs font-semibold ${isDark ? 'border-[#3a3a40] bg-[#202024] text-zinc-100 hover:bg-[#29292e]' : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100'}`}>Open Agent Chat</button>
              </div>
            )}
          </div>

          {/* Properties Grid */}
          <div className={`p-5 border-b space-y-3 text-xs ${isDark ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
            <span className={`font-mono uppercase tracking-wider text-[10px] font-semibold block ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Properties
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="task-office-assignee" className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Assigned employee</label>
                <select
                  id="task-office-assignee"
                  value={selectedIssue.assignedEmployeeId || ''}
                  onChange={(event) => handleAssigneeChange(event.target.value)}
                  className={`max-w-[65%] rounded-md border px-2 py-1 text-right text-xs outline-none ${isDark ? 'border-[#3a3a40] bg-[#202024] text-zinc-200' : 'border-zinc-300 bg-white text-zinc-800'}`}
                >
                  <option value="">Unassigned</option>
                  {selectedIssue.assignedEmployeeId && !selectedIssueEmployee && <option value={selectedIssue.assignedEmployeeId} disabled>{selectedIssue.assignee || 'Former teammate'} · removed from team</option>}
                  {selectedIssueEmployee && !selectedIssueEmployee.enabled && <option value={selectedIssueEmployee.id} disabled>{selectedIssueEmployee.name} · away from office</option>}
                  {officeEmployees.filter((employee) => employee.enabled).map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.roleTitle}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Assignee</span>
                <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{selectedIssue.assignee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Project</span>
                <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{selectedIssue.projectName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Date Logged</span>
                <span className={`font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{selectedIssue.date}</span>
              </div>
            </div>
          </div>

          {/* Comments Discussion Thread */}
          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className={`font-mono uppercase tracking-wider text-[10px] font-semibold block ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                Activity & Comments ({(selectedIssue.comments || []).length})
              </span>

              <div className="space-y-2">
                {(selectedIssue.comments || []).map((c, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border space-y-1 text-xs ${
                    isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{c.author}</span>
                      <span className="font-mono">{c.date}</span>
                    </div>
                    <p className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{c.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment input form */}
            <form onSubmit={handleAddComment} className="pt-4 flex items-center gap-2">
              <input
                aria-label="Add a task comment"
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Leave an instruction or comment..."
                className={`flex-1 px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                  isDark ? 'bg-[#121215] border-[#27272a] text-white focus:border-zinc-500' : 'bg-white border-zinc-300 text-black focus:border-zinc-500'
                }`}
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                aria-label="Post comment"
                className="p-2 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
