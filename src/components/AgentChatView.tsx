import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  FolderOpen,
  LoaderCircle,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Square,
} from './ui/FormativeGlyphs';
import codexMark from '../assets/providers/codex.svg';
import claudeCodeMark from '../assets/providers/claude-code.svg';
import type { OfficeMemberProfile, Project, ThemeMode } from '../types';
import type { AgentProviderId, AgentProviderStatus, AgentRun, AgentRunEvent } from '../types/agentRuns';
import { getProjectOfficeTeam } from './office/officeCast';
import { MarkdownContent } from './chat/MarkdownContent';
import { AgentExecutionTrace } from './chat/AgentExecutionTrace';
import { cleanPromptForDisplay, getConversationCleanTitle } from '../utils/promptUtils';

export interface StartChatRun {
  providerId: AgentProviderId;
  conversationId: string;
  prompt: string;
  displayPrompt?: string;
  title?: string;
  employeeId?: string;
  taskId?: string;
}

const STARTER_PROMPTS = [
  'Explain the overall project architecture and key modules',
  'Find potential bugs, missing error handlers, or edge cases',
  'Summarize package dependencies and scripts in package.json',
  'Suggest performance optimizations and cleanup areas',
];

interface AgentChatViewProps {
  theme: ThemeMode;
  project: Project;
  isDesktopApp: boolean;
  onOpenProjectLibrary: () => void;
  providerStatuses: AgentProviderStatus[];
  isCheckingProviders: boolean;
  onRefreshProviders: () => void;
  onStartRun: (request: StartChatRun) => Promise<{ success: boolean; error?: string }>;
  onStopRun: (runId: string) => Promise<void>;
  initialTaskId?: string | null;
  onInitialTaskHandled?: () => void;
  initialConversationId?: string | null;
  onInitialConversationHandled?: () => void;
}

const PROVIDER_ORDER: AgentProviderId[] = ['codex-cli', 'claude-code', 'antigravity'];

const PROVIDER_SETUP: Record<AgentProviderId, { title: string; subtitle: string }> = {
  'codex-cli': { title: 'Codex', subtitle: 'Use Codex CLI on this computer' },
  'claude-code': { title: 'Claude Code', subtitle: 'Use Claude Code on this computer' },
  antigravity: { title: 'Antigravity', subtitle: 'Connection support is being worked on' },
  opencode: { title: 'OpenCode', subtitle: 'Not available in this workflow yet' },
  openclaw: { title: 'OpenClaw', subtitle: 'Not available in this workflow yet' },
  ollama: { title: 'Ollama', subtitle: 'Not available in this workflow yet' },
  kiro: { title: 'Kiro', subtitle: 'Not available in this workflow yet' },
  api: { title: 'API connection', subtitle: 'Not available in this workflow yet' },
  mcp: { title: 'MCP connection', subtitle: 'Not available in this workflow yet' },
};

const RUNNING_STATUSES = new Set(['queued', 'starting', 'running', 'waiting_for_approval', 'stopping']);

function ProviderMark({ providerId, dark, size = 'h-6 w-6' }: { providerId: AgentProviderId; dark: boolean; size?: string }) {
  const source = providerId === 'codex-cli' ? codexMark : providerId === 'claude-code' ? claudeCodeMark : null;
  if (source) {
    const frameBorder = dark ? 'border-[#3a3a3d]' : 'border-zinc-700';
    return (
      <span className={`${size} inline-flex shrink-0 items-center justify-center rounded-lg border ${frameBorder} bg-[#09090b] p-1 shadow-xs`} aria-hidden="true">
        <img src={source} className="h-full w-full object-contain" alt="" />
      </span>
    );
  }

  return <span className={`${size} inline-grid place-items-center rounded-lg border border-zinc-700 bg-[#09090b] text-sm font-bold leading-none tracking-[-0.08em] ${dark ? 'text-zinc-200' : 'text-zinc-700'}`} aria-hidden="true">A</span>;
}

function providerStatusLabel(providerId: AgentProviderId, status: AgentProviderStatus | undefined, isDesktopApp: boolean, isChecking: boolean) {
  if (providerId === 'antigravity') return 'Not available yet';
  if (!isDesktopApp) return 'Desktop app required';
  if (isChecking) return 'Checking';
  if (status?.state === 'installed' && status.capabilities.canStartRun) return 'Ready';
  if (status?.state === 'installed') return 'Detected';
  if (status?.state === 'missing') return 'Not installed';
  if (status?.state === 'unsupported') return 'Not supported';
  return 'Not checked';
}

function accessNote(providerId: AgentProviderId, taskLinked = false) {
  const providerName = PROVIDER_SETUP[providerId]?.title || 'the provider';
  const taskDisclosure = taskLinked ? ' The linked task key, title, status, and description are also sent as context.' : '';
  if (providerId === 'codex-cli') {
    return `Read-only access to this project. Codex may run read-only checks inside its local sandbox, but it cannot save file changes. Your prompt and relevant project context may be sent to ${providerName}; usage follows your provider account.${taskDisclosure}`;
  }
  if (providerId === 'claude-code') {
    return `Claude Code starts in safe, plan-only mode with project reading and search tools. It cannot save file changes, run shell commands, or use project MCP tools in this first workflow. Your prompt and relevant project context may be sent to Anthropic; usage follows your provider account.${taskDisclosure}`;
  }
  return `Read-only access to this project. Your prompt and relevant project context may be sent to ${providerName}; usage follows your provider account.`;
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function makeLocalId(prefix: string) {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

function StatusMark({ status, dark }: { status: AgentRun['status']; dark: boolean }) {
  if (RUNNING_STATUSES.has(status)) return <LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue-500" aria-hidden="true" />;
  if (status === 'completed') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />;
  if (status === 'cancelled') return <Square className="h-3 w-3 text-zinc-500" aria-hidden="true" />;
  return <CircleAlert className={`h-3.5 w-3.5 ${dark ? 'text-rose-400' : 'text-rose-600'}`} aria-hidden="true" />;
}

function eventLabel(event: AgentRunEvent) {
  switch (event.type) {
    case 'tool_started': return event.summary || 'Agent is checking the project';
    case 'tool_finished': return event.summary || 'Project check complete';
    case 'warning': return event.summary || 'The agent reported a limitation';
    case 'error': return event.summary || 'The agent hit a problem';
    case 'completed': return event.summary || 'Run complete';
    case 'cancelled': return event.summary || 'Run stopped';
    case 'progress': return event.summary;
    default: return '';
  }
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  theme,
  project,
  isDesktopApp,
  onOpenProjectLibrary,
  providerStatuses,
  isCheckingProviders,
  onRefreshProviders,
  onStartRun,
  onStopRun,
  initialTaskId = null,
  onInitialTaskHandled,
  initialConversationId = null,
  onInitialConversationHandled,
}) => {
  const dark = theme !== 'light';
  const conversations = useMemo(
    () => [...(project.agentConversations || [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [project.agentConversations],
  );
  const officeTeam = useMemo(() => getProjectOfficeTeam(project.officeConfig), [project.officeConfig]);
  const assignableEmployees = useMemo(() => [officeTeam.ceo, ...officeTeam.employees.filter((item) => item.enabled)], [officeTeam]);
  const [conversationId, setConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [newProviderId, setNewProviderId] = useState<AgentProviderId>('codex-cli');
  const [employeeId, setEmployeeId] = useState(officeTeam.ceo.id);
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState('');
  const skipNextConversationSync = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId && !conversations.some((item) => item.id === conversationId)) {
      setConversationId(conversations[0]?.id || null);
    }
  }, [conversationId, conversations]);

  const activeConversation = conversations.find((item) => item.id === conversationId) || null;
  useEffect(() => {
    if (skipNextConversationSync.current) {
      skipNextConversationSync.current = false;
      return;
    }
    setTaskId(activeConversation?.taskId || '');
    const conversationEmployee = assignableEmployees.find((employee) => employee.id === activeConversation?.employeeId);
    setEmployeeId(conversationEmployee?.id || officeTeam.ceo.id);
  }, [activeConversation?.id, assignableEmployees, officeTeam.ceo.id]);

  useEffect(() => {
    if (!initialConversationId) return;
    setConversationId(initialConversationId);
    onInitialConversationHandled?.();
  }, [initialConversationId, onInitialConversationHandled]);

  useEffect(() => {
    if (!initialTaskId) return;
    const selectedTask = (project.issues || []).find((issue) => issue.id === initialTaskId);
    if (!selectedTask) {
      onInitialTaskHandled?.();
      return;
    }
    skipNextConversationSync.current = true;
    setConversationId(null);
    setTaskId(selectedTask.id);
    setPrompt('');
    const assignedEmployee = assignableEmployees.find((employee) => employee.id === selectedTask.assignedEmployeeId);
    if (assignedEmployee) setEmployeeId(assignedEmployee.id);
    onInitialTaskHandled?.();
  }, [initialTaskId, project.issues, assignableEmployees, onInitialTaskHandled]);

  const handleTaskSelection = (nextTaskId: string) => {
    setTaskId(nextTaskId);
    const selectedTask = (project.issues || []).find((issue) => issue.id === nextTaskId);
    const assignedEmployee = assignableEmployees.find((employee) => employee.id === selectedTask?.assignedEmployeeId);
    if (assignedEmployee) setEmployeeId(assignedEmployee.id);
  };

  useEffect(() => {
    if (activeConversation) return;
    const selectedEmployee = assignableEmployees.find((employee) => employee.id === employeeId);
    if (selectedEmployee?.preferredProviderId === 'codex-cli' || selectedEmployee?.preferredProviderId === 'claude-code') {
      setNewProviderId(selectedEmployee.preferredProviderId);
    }
  }, [activeConversation, assignableEmployees, employeeId]);

  const providerId = activeConversation?.providerId || newProviderId;
  const providerStatus = providerStatuses.find((item) => item.providerId === providerId);
  const canStartRun = Boolean(providerStatus?.capabilities.canStartRun && project.folderPath);
  const conversationReadinessLabel = !isDesktopApp
    ? 'Desktop app required'
    : !project.folderPath
      ? 'Project folder required'
      : providerStatus?.capabilities.canStartRun
        ? 'Ready'
        : providerStatus?.state === 'missing'
          ? 'Provider not installed'
          : isCheckingProviders
            ? 'Checking provider'
            : 'Provider not checked';
  const conversationRuns = useMemo(() => {
    if (!activeConversation) return [];
    return (project.agentRuns || [])
      .filter((run) => run.conversationId === activeConversation.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [activeConversation, project.agentRuns]);
  const currentRun = [...conversationRuns].reverse().find((run) => RUNNING_STATUSES.has(run.status)) || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationRuns.length, currentRun?.events.length]);

  const startNewConversation = () => {
    setConversationId(null);
    setPrompt('');
    setTaskId('');
    setEmployeeId(officeTeam.ceo.id);
    setLocalError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || currentRun || !canStartRun || !prompt.trim()) return;
    const selectedConversationId = activeConversation?.id || makeLocalId('conversation');
    setSubmitting(true);
    setLocalError(null);
    try {
      const result = await onStartRun({
        providerId,
        conversationId: selectedConversationId,
        prompt: prompt.trim(),
        employeeId,
        ...(taskId ? { taskId } : {}),
      });
      setConversationId(selectedConversationId);
      if (!result.success) {
        setLocalError(result.error || 'Formative could not start this run.');
      } else {
        setPrompt('');
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Formative could not start this run.');
    } finally {
      setSubmitting(false);
    }
  };

  const shell = dark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f7f7f8] text-zinc-900';
  const subtle = dark ? 'text-zinc-400' : 'text-zinc-600';
  const quiet = dark ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${shell}`}>
      <div className={`flex min-h-0 flex-1 overflow-hidden border-t ${dark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
        <aside className={`flex w-60 xl:w-64 shrink-0 flex-col border-r ${dark ? 'border-[#27272a] bg-[#0d0d0f]' : 'border-zinc-200 bg-[#fbfbfc]'}`} aria-label="Agent conversations">
          <div className="flex items-center justify-between gap-2 px-3.5 py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Conversations</h2>
              <p className={`mt-0.5 truncate text-[13px] ${quiet}`}>{project.name}</p>
            </div>
            <button
              type="button"
              onClick={startNewConversation}
              aria-label="Start a new agent conversation"
              title="New conversation"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors ${dark ? 'border-[#333338] text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {conversations.length === 0 ? (
              <div className={`rounded-lg border border-dashed px-3 py-4 text-center text-[13px] leading-5 ${dark ? 'border-[#303035] text-zinc-400' : 'border-zinc-300 text-zinc-600'}`}>
                Your conversations will appear here.
              </div>
            ) : conversations.map((conversation) => {
              const selected = conversation.id === activeConversation?.id;
              const title = PROVIDER_SETUP[conversation.providerId]?.title || 'Agent';
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => { setConversationId(conversation.id); setLocalError(null); }}
                  aria-current={selected ? 'page' : undefined}
                  className={`mb-1 flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${selected
                    ? dark ? 'bg-[#252529] text-white' : 'bg-zinc-200/80 text-zinc-950'
                    : dark ? 'text-zinc-300 hover:bg-[#18181b]' : 'text-zinc-700 hover:bg-zinc-100'}`}
                >
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center ${selected ? dark ? 'opacity-100' : 'opacity-90' : 'opacity-70'}`}>
                    <ProviderMark providerId={conversation.providerId} dark={dark} size="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{getConversationCleanTitle(conversation.title)}</span>
                    <span className={`mt-0.5 block truncate text-[13px] ${quiet}`}>{title}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className={`border-t px-3.5 py-2.5 text-[13px] leading-relaxed ${dark ? 'border-[#27272a]' : 'border-zinc-200'} ${quiet}`}>
            <div className="flex items-start gap-2">
              <FolderOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate" title={project.folderPath || 'No local project folder'}>{project.folderPath || 'No local folder selected'}</span>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="Agent chat workspace">
          {activeConversation ? (
            <>
              <div className={`flex min-h-[64px] items-center justify-between gap-3 border-b px-5 py-3 ${dark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${dark ? 'border-[#303036] bg-[#18181b]' : 'border-zinc-200 bg-zinc-50'}`}>
                      <ProviderMark providerId={activeConversation.providerId} dark={dark} size="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-base font-semibold">{getConversationCleanTitle(activeConversation.title)}</h1>
                      <p className={`mt-0.5 text-[13px] ${subtle}`}>{PROVIDER_SETUP[activeConversation.providerId]?.title || 'Agent'} · {project.name}</p>
                  </div>
                </div>
                {currentRun ? (
                  <button
                    type="button"
                    onClick={() => { void onStopRun(currentRun.id); }}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${dark ? 'border-[#45454c] text-zinc-200 hover:bg-zinc-800' : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100'}`}
                  >
                    <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Stop run
                  </button>
                ) : (
                  <span className={`hidden shrink-0 items-center px-2.5 py-1 rounded-md text-xs font-mono border sm:flex ${
                    conversationReadinessLabel === 'Ready'
                      ? dark ? 'border-zinc-700 bg-zinc-800/80 text-zinc-300' : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                      : dark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'
                  }`}>
                    {conversationReadinessLabel}
                  </span>
                )}
              </div>

              <details className={`group border-b px-5 py-2.5 text-[13px] ${dark ? 'border-[#27272a] bg-[#101013] text-zinc-300' : 'border-zinc-200 bg-[#fcfcfd] text-zinc-700'}`}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-2 gap-y-1 font-medium marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <ShieldCheck className={`h-4 w-4 shrink-0 ${dark ? 'text-zinc-300' : 'text-zinc-600'}`} aria-hidden="true" />
                  <span>Read-only access</span>
                  <span className={`font-normal ${subtle}`}>· Your message and relevant project context may be sent to the provider</span>
                </summary>
                <p className={`ml-6 mt-2 max-w-5xl leading-relaxed ${subtle}`}>{accessNote(activeConversation.providerId, Boolean(taskId))}</p>
              </details>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5" role="log" aria-label="Conversation messages and agent progress">
                {conversationRuns.length === 0 ? (
                  <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
                    <div className={`mb-3.5 grid h-14 w-14 place-items-center rounded-2xl border ${dark ? 'border-[#303036] bg-[#151518]' : 'border-zinc-200 bg-white'}`}>
                      <ProviderMark providerId={activeConversation.providerId} dark={dark} size="h-7 w-7" />
                    </div>
                    <h2 className="text-base font-semibold">Start with a project question</h2>
                    <p className={`mt-2 text-[14px] leading-relaxed ${subtle}`}>Ask this agent to explain code, review architecture, or verify functions. All runs are sandboxed and read-only.</p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
                      {STARTER_PROMPTS.map((starter) => (
                        <button
                          key={starter}
                          type="button"
                          onClick={() => setPrompt(starter)}
                          className={`text-xs px-3.5 py-2 rounded-xl border transition-all text-left flex items-center gap-2 ${
                            dark
                              ? 'border-[#333339] bg-[#161619] hover:bg-[#202025] hover:border-zinc-500 text-zinc-300'
                              : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 shadow-xs'
                          }`}
                        >
                          <span className="text-brand">✦</span>
                          <span>{starter}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex w-full max-w-4xl xl:max-w-5xl flex-col gap-6">
                    {conversationRuns.map((run) => {
                      const linkedTask = (project.issues || []).find((issue) => issue.id === run.taskId);
                      const assignedEmployee = assignableEmployees.find((e) => e.id === run.employeeId || e.id === activeConversation.employeeId);
                      return (
                        <RunHistory
                          key={run.id}
                          run={run}
                          dark={dark}
                          providerId={activeConversation.providerId}
                          taskLabel={linkedTask ? `${linkedTask.key} · ${linkedTask.title}` : undefined}
                          employee={assignedEmployee}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className={`shrink-0 border-t px-5 py-3.5 ${dark ? 'border-[#27272a] bg-[#0d0d0f]' : 'border-zinc-200 bg-white'}`}>
                {localError && (
                  <div role="alert" className="mx-auto mb-2.5 max-w-4xl xl:max-w-5xl rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-[13px] text-rose-700 dark:text-rose-300">{localError}</div>
                )}
                <div className={`mx-auto max-w-4xl xl:max-w-5xl rounded-xl border shadow-sm transition-colors ${dark ? 'border-[#36363c] bg-[#151518] focus-within:border-zinc-500' : 'border-zinc-300 bg-white focus-within:border-zinc-400'}`}>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder={project.folderPath ? 'Ask about this project (Enter to send, Shift+Enter for newline)…' : 'Choose a local project folder to start'}
                    aria-label="Message the agent"
                    maxLength={20000}
                    rows={2}
                    disabled={!project.folderPath || !providerStatus?.capabilities.canStartRun || Boolean(currentRun) || submitting}
                    className={`block max-h-48 min-h-[76px] w-full resize-y bg-transparent px-4 py-3 text-sm leading-relaxed outline-none placeholder:opacity-60 disabled:cursor-not-allowed ${dark ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-900 placeholder:text-zinc-500'}`}
                  />
                  <div className={`flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2.5 ${dark ? 'border-[#303036]' : 'border-zinc-100'}`}>
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                      <label className={`flex min-w-0 items-center gap-2 text-[13px] ${subtle}`}>
                        <span className="shrink-0 font-medium">Handled by</span>
                        <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} aria-label="Assign this run to an office employee" className={`max-w-[190px] min-w-0 rounded-md border px-2.5 py-1.5 text-[13px] outline-none ${dark ? 'border-[#3a3a40] bg-[#202024] text-zinc-200' : 'border-zinc-300 bg-zinc-50 text-zinc-800'}`}>
                          {assignableEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.roleTitle}</option>)}
                        </select>
                      </label>
                      <label className={`flex min-w-0 items-center gap-2 text-[13px] ${subtle}`}>
                        <span className="shrink-0 font-medium">Link to task</span>
                        <select value={taskId} onChange={(event) => handleTaskSelection(event.target.value)} aria-label="Link this run to a project task" className={`max-w-[280px] min-w-0 rounded-md border px-2.5 py-1.5 text-[13px] outline-none ${dark ? 'border-[#3a3a40] bg-[#202024] text-zinc-200' : 'border-zinc-300 bg-zinc-50 text-zinc-800'}`}>
                          <option value="">No task</option>
                          {(project.issues || []).map((issue) => <option key={issue.id} value={issue.id}>{issue.key} · {issue.title}</option>)}
                        </select>
                      </label>
                    </div>

                    {currentRun ? (
                      <button
                        type="button"
                        onClick={() => { void onStopRun(currentRun.id); }}
                        className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg bg-rose-600 px-4 text-[13px] font-semibold text-white hover:bg-rose-500 transition-colors shadow-xs"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                        Stop run
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!prompt.trim() || !canStartRun || submitting}
                        className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover active:bg-brand-active disabled:cursor-not-allowed disabled:opacity-45 shadow-xs"
                      >
                        {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                        {submitting ? 'Starting…' : 'Send'}
                      </button>
                    )}
                  </div>
                </div>
                <p className={`mx-auto mt-2 max-w-4xl xl:max-w-5xl text-right text-xs ${quiet}`}>Enter to send · Shift+Enter for new line · read-only run</p>
              </form>
            </>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 xl:px-8">
              <div className="mx-auto w-full max-w-3xl">
                <header className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold tracking-tight">New conversation</h1>
                    <p className={`mt-1 text-[14px] leading-relaxed ${subtle}`}>Ask about {project.name} in your own words.</p>
                  </div>
                  {isDesktopApp ? (
                    <button
                      type="button"
                      onClick={onRefreshProviders}
                      disabled={isCheckingProviders}
                      className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${dark ? 'border-[#38383e] text-zinc-200 hover:bg-zinc-800' : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100'}`}
                    >
                      <RefreshCw className={`h-4 w-4 ${isCheckingProviders ? 'animate-spin' : ''}`} aria-hidden="true" />
                      {isCheckingProviders ? 'Checking…' : 'Check installs'}
                    </button>
                  ) : (
                    <span className={`shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium ${dark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'}`}>
                      Desktop app required
                    </span>
                  )}
                </header>

                {!project.folderPath && (
                  <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 border-y py-3 text-[14px] leading-relaxed ${dark ? 'border-[#303036] text-zinc-300' : 'border-zinc-200 text-zinc-700'}`}>
                    <div className="flex min-w-0 items-start gap-2.5">
                      <FolderOpen className={`mt-0.5 h-4 w-4 shrink-0 ${subtle}`} aria-hidden="true" />
                      <p>{isDesktopApp ? 'Choose a local project folder before starting an agent.' : 'Open Formative desktop and choose a local project folder to start an agent.'}</p>
                    </div>
                    {isDesktopApp && <button type="button" onClick={onOpenProjectLibrary} className={`shrink-0 font-medium underline underline-offset-4 ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>Choose folder</button>}
                  </div>
                )}

                <section className="mt-6" aria-labelledby="agent-provider-heading">
                  <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 id="agent-provider-heading" className="text-sm font-semibold">Choose an agent</h2>
                    <p className={`text-[13px] ${subtle}`}>The conversation stays with this agent.</p>
                  </div>
                  <div role="radiogroup" aria-labelledby="agent-provider-heading" className={`overflow-hidden rounded-xl border ${dark ? 'border-[#303036] bg-[#111114]' : 'border-zinc-200 bg-white'}`}>
                    {PROVIDER_ORDER.map((provider, index) => {
                      const status = providerStatuses.find((item) => item.providerId === provider);
                      const selected = provider === newProviderId;
                      const label = providerStatusLabel(provider, status, isDesktopApp, isCheckingProviders);
                      const ready = label === 'Ready';
                      return (
                        <button
                          key={provider}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          tabIndex={selected ? 0 : -1}
                          onClick={() => setNewProviderId(provider)}
                          onKeyDown={(event) => {
                            if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return;
                            event.preventDefault();
                            const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
                            const nextIndex = (index + direction + PROVIDER_ORDER.length) % PROVIDER_ORDER.length;
                            const nextProvider = PROVIDER_ORDER[nextIndex];
                            setNewProviderId(nextProvider);
                            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
                          }}
                          className={`flex min-h-[62px] w-full items-center gap-3.5 px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${index > 0 ? dark ? 'border-t border-[#303036]' : 'border-t border-zinc-200' : ''} ${selected ? dark ? 'bg-[#1a1a1e]' : 'bg-zinc-50' : dark ? 'hover:bg-[#17171a]' : 'hover:bg-zinc-50'}`}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${dark ? 'border-[#37373d] bg-[#17171a]' : 'border-zinc-200 bg-white'}`}>
                            <ProviderMark providerId={provider} dark={dark} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-semibold">{PROVIDER_SETUP[provider].title}</span>
                            <span className={`mt-0.5 block text-[13px] leading-snug ${subtle}`}>{PROVIDER_SETUP[provider].subtitle}</span>
                          </span>
                          <span className={`flex shrink-0 items-center gap-2 text-[13px] font-medium ${ready ? dark ? 'text-emerald-300' : 'text-emerald-800' : subtle}`}>
                            <span className={`h-2 w-2 rounded-full ${ready ? 'bg-emerald-500' : dark ? 'bg-zinc-600' : 'bg-zinc-400'}`} aria-hidden="true" />
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {providerStatus?.explanation && !providerStatus.capabilities.canStartRun && (
                    <p className={`mt-2 text-[13px] leading-relaxed ${subtle}`}>{providerStatus.explanation}</p>
                  )}
                  {!providerStatuses.length && (
                    <p className={`mt-2 text-[13px] ${subtle}`}>
                      {isCheckingProviders ? 'Checking for local agent installations…' : isDesktopApp ? 'Install Codex or Claude Code, then check again.' : 'Local agent checks are available in Formative desktop.'}
                    </p>
                  )}
                </section>

                <form onSubmit={handleSubmit} className={`mt-6 overflow-hidden rounded-xl border ${dark ? 'border-[#37373d] bg-[#111114]' : 'border-zinc-300 bg-white'}`}>
                  <div className="px-4 pt-4">
                    <label htmlFor="agent-first-prompt" className="text-[14px] font-semibold">What would you like to understand?</label>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {STARTER_PROMPTS.map((starter) => (
                        <button
                          key={starter}
                          type="button"
                          onClick={() => setPrompt(starter)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left flex items-center gap-1.5 ${
                            dark
                              ? 'border-[#333339] bg-[#18181c] hover:bg-[#222227] hover:border-zinc-500 text-zinc-300'
                              : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700 shadow-xs'
                          }`}
                        >
                          <span className="text-brand">✦</span>
                          <span>{starter}</span>
                        </button>
                      ))}
                    </div>
                    <textarea
                      id="agent-first-prompt"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder="For example: Explain how this app saves project settings."
                      maxLength={20000}
                      rows={3}
                      disabled={!project.folderPath || !canStartRun || submitting}
                      className={`mt-2.5 block min-h-24 w-full resize-y rounded-lg border px-3.5 py-3 text-[14px] leading-relaxed outline-none focus:border-zinc-500 disabled:cursor-not-allowed ${dark ? 'border-[#37373d] bg-[#17171a] text-zinc-100 placeholder:text-zinc-500' : 'border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500'}`}
                    />
                  </div>
                  {localError && <p role="alert" className="mx-4 mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-700 dark:text-rose-300">{localError}</p>}
                  <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 ${dark ? 'border-[#303036]' : 'border-zinc-200'}`}>
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                      <label className={`flex min-w-0 items-center gap-2 text-[13px] ${subtle}`}>
                        <span className="shrink-0 font-medium">Handled by</span>
                        <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} aria-label="Assign this run to an office employee" className={`max-w-[190px] min-w-0 rounded-md border px-2.5 py-1.5 text-[13px] outline-none ${dark ? 'border-[#3a3a40] bg-[#202024] text-zinc-200' : 'border-zinc-300 bg-zinc-50 text-zinc-800'}`}>
                          {assignableEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.roleTitle}</option>)}
                        </select>
                      </label>
                      <label className={`flex min-w-0 items-center gap-2 text-[13px] ${subtle}`}>
                        <span className="shrink-0 font-medium">Link to task</span>
                        <select value={taskId} onChange={(event) => handleTaskSelection(event.target.value)} aria-label="Link this run to a project task" className={`max-w-[280px] min-w-0 rounded-md border px-2.5 py-1.5 text-[13px] outline-none ${dark ? 'border-[#3a3a40] bg-[#202024] text-zinc-200' : 'border-zinc-300 bg-zinc-50 text-zinc-800'}`}>
                          <option value="">No task</option>
                          {(project.issues || []).map((issue) => <option key={issue.id} value={issue.id}>{issue.key} · {issue.title}</option>)}
                        </select>
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={!prompt.trim() || !canStartRun || !project.folderPath || submitting}
                      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-brand px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover active:bg-brand-active disabled:cursor-not-allowed disabled:opacity-45 shadow-xs"
                    >
                      {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                      {submitting ? 'Starting…' : 'Start conversation'}
                    </button>
                  </div>
                </form>

                <div className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-relaxed ${subtle}`}>
                  <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span><strong className={dark ? 'font-semibold text-zinc-200' : 'font-semibold text-zinc-800'}>Read-only mode.</strong> The agent can inspect project context but cannot save file changes.</span>
                  <details className="group">
                    <summary className={`cursor-pointer underline underline-offset-4 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>What gets sent?</summary>
                    <p className="mt-1 max-w-3xl">{accessNote(providerId, Boolean(taskId))}</p>
                  </details>
                </div>
                {providerStatus?.state === 'installed' && providerStatus.authentication === 'not_checked' && (
                  <p className={`mt-2 text-[13px] ${quiet}`}>Formative checks installation only. Your provider handles sign-in when a run begins.</p>
                )}
                <p className={`mt-3 text-right text-[12px] ${quiet}`}>Ctrl/⌘ + Enter to start</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function RunHistory({
  run,
  dark,
  providerId,
  taskLabel,
  employee,
}: {
  run: AgentRun;
  dark: boolean;
  providerId: AgentProviderId;
  taskLabel?: string;
  employee?: OfficeMemberProfile;
}) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const assistantEvents = run.events.filter((event) => event.type === 'assistant_message');
  const statusEvents = run.events.filter((event) => event.type !== 'assistant_message' && event.type !== 'prompt');
  const isRunning = RUNNING_STATUSES.has(run.status);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(run.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {}
  };

  const handleCopyResponse = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch {}
  };

  return (
    <article className="flex flex-col gap-4">
      {/* User Message */}
      <div className="flex justify-end group">
        <div className={`relative max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed shadow-xs ${
          dark ? 'bg-[#222227] text-zinc-100 border border-[#2e2e36]' : 'bg-brand/10 text-zinc-900 border border-brand/20'
        }`}>
          {taskLabel && (
            <p className="mb-1.5 truncate text-xs font-semibold text-brand">
              Linked task · {taskLabel}
            </p>
          )}
          <p className="whitespace-pre-wrap break-words">{run.displayPrompt || cleanPromptForDisplay(run.prompt)}</p>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs font-mono opacity-70">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`opacity-0 group-hover:opacity-100 transition-opacity hover:underline flex items-center gap-1.5 ${
                copiedPrompt ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
            </button>
            <span className={dark ? 'text-zinc-400' : 'text-zinc-500'}>{formatTime(run.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Structured Tool & Progress Execution Trace */}
      <AgentExecutionTrace
        events={statusEvents}
        status={run.status}
        dark={dark}
        formatTime={formatTime}
      />

      {/* Assistant Messages */}
      {assistantEvents.map((event) => {
        const fullContent = event.details || event.summary;
        return (
          <div key={event.id} className="flex justify-start group">
            <div className={`w-full max-w-[94%] xl:max-w-[92%] rounded-2xl rounded-bl-sm border px-5 py-4 text-[14px] leading-relaxed shadow-xs ${
              dark ? 'border-[#2d2d34] bg-[#141418] text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'
            }`}>
              <div className="mb-3 flex items-center justify-between border-b pb-2.5 gap-2" style={{ borderColor: dark ? '#222228' : '#f0f0f3' }}>
                <div className="flex items-center gap-2.5">
                  <ProviderMark providerId={providerId} dark={dark} size="h-7 w-7" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[14px] font-semibold ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        {employee ? employee.name : (PROVIDER_SETUP[providerId]?.title || 'Agent')}
                      </span>
                      {employee && (
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          dark ? 'bg-zinc-800 text-zinc-400 border border-zinc-700/60' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {employee.roleTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyResponse(fullContent)}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono flex items-center gap-1.5 ${
                    copiedResponse ? 'text-emerald-400' : dark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Copy response"
                >
                  {copiedResponse ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <MarkdownContent
                content={fullContent}
                dark={dark}
                isStreaming={isRunning}
              />
            </div>
          </div>
        );
      })}

      {!assistantEvents.length && isRunning && (
        <div role="status" className={`flex items-center gap-2.5 pl-2 text-[13px] ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
          <span className="font-medium">Agent is inspecting project files…</span>
        </div>
      )}

      {/* Status Footer */}
      <div className={`flex items-center gap-2 pl-2 text-[12px] font-mono ${dark ? 'text-zinc-500' : 'text-zinc-600'}`}>
        <StatusMark status={run.status} dark={dark} />
        <span className="capitalize">{run.status.replaceAll('_', ' ')}</span>
        {run.finishedAt && <span>· {formatTime(run.finishedAt)}</span>}
      </div>
    </article>
  );
}
