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
} from 'lucide-react';
import { IssueItem, ThemeMode, Project } from '../types';

interface IssuesViewProps {
  theme: ThemeMode;
  activeProject?: Project | null;
  onUpdateProjectIssues?: (issues: IssueItem[], nextTaskNumber?: number) => void;
  onOpenNewIssue?: () => void;
}

export const IssuesView: React.FC<IssuesViewProps> = ({ 
  theme, 
  activeProject,
  onUpdateProjectIssues,
  onOpenNewIssue 
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
                <span className="text-xs font-semibold text-zinc-300">New task</span>
                <p className="text-[11px] text-zinc-500 mt-0.5">Tasks are saved to this project. They do not start an agent run.</p>
              </div>
              <button type="button" onClick={() => setIsCreatingIssue(false)} className="text-zinc-500 hover:text-white">
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
                Create tasks for this project. Agent assignment will be available when agent runs are connected.
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
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2"
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
                          <span className="text-xs font-mono text-zinc-400 shrink-0 font-medium">{item.key}</span>
                          <span className="text-sm font-semibold truncate group-hover:underline">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-zinc-400 hidden sm:inline">{item.assignee}</span>
                          <span className="text-xs text-zinc-500 font-mono">{item.date}</span>
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
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2"
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
                          <span className="text-xs font-mono text-zinc-400 shrink-0 font-medium">{item.key}</span>
                          <span className="text-sm font-semibold truncate group-hover:underline">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-zinc-400 hidden sm:inline">{item.assignee}</span>
                          <span className="text-xs text-zinc-500 font-mono">{item.date}</span>
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
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2"
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
                          <span className="text-xs font-mono text-zinc-400 shrink-0 font-medium">{item.key}</span>
                          <span className="text-sm font-semibold truncate group-hover:underline">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-zinc-400 hidden sm:inline">{item.assignee}</span>
                          <span className="text-xs text-zinc-500 font-mono">{item.date}</span>
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
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2"
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
                          <span className="text-xs font-mono text-zinc-400 shrink-0 font-medium line-through">{item.key}</span>
                          <span className="text-sm font-semibold truncate line-through">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-zinc-400 hidden sm:inline">{item.assignee}</span>
                          <span className="text-xs text-zinc-500 font-mono">{item.date}</span>
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
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span>{selectedIssue.key}</span>
                <span>•</span>
                <span className="text-zinc-200 font-semibold">{selectedIssue.projectName}</span>
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
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {selectedIssue.description || 'No description provided.'}
            </p>
          </div>

          {/* Agent runs will be connected after a real provider can start and control them. */}
          <div className="p-5 border-b border-zinc-800/80 space-y-3">
            <div className={`p-4 rounded-xl border space-y-2 ${
              isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <p className="text-xs font-semibold text-zinc-300">No agent run is linked to this task.</p>
              <p className="text-xs leading-relaxed text-zinc-400">
                Formative does not start or stop agents from this screen yet. When a real agent run is available, its actual progress will appear here.
              </p>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="p-5 border-b border-zinc-800/80 space-y-3 text-xs">
            <span className="font-mono uppercase tracking-wider text-zinc-500 text-[10px] font-semibold block">
              Properties
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Assignee</span>
                <span className="font-semibold text-zinc-200">{selectedIssue.assignee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Project</span>
                <span className="font-semibold text-zinc-200">{selectedIssue.projectName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Date Logged</span>
                <span className="font-mono text-zinc-400">{selectedIssue.date}</span>
              </div>
            </div>
          </div>

          {/* Comments Discussion Thread */}
          <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono uppercase tracking-wider text-zinc-500 text-[10px] font-semibold block">
                Activity & Comments ({(selectedIssue.comments || []).length})
              </span>

              <div className="space-y-2">
                {(selectedIssue.comments || []).map((c, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border space-y-1 text-xs ${
                    isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                      <span className="font-semibold text-zinc-200">{c.author}</span>
                      <span className="font-mono">{c.date}</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{c.content}</p>
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
