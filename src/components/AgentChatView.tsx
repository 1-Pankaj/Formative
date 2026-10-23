import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FolderOpen,
  LoaderCircle,
  MessageSquareText,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Square,
} from 'lucide-react';
import type { Project, ThemeMode } from '../types';
import type { AgentProviderId, AgentProviderStatus, AgentRun, AgentRunEvent } from '../types/agentRuns';

export interface StartChatRun {
  providerId: AgentProviderId;
  conversationId: string;
  prompt: string;
  taskId?: string;
}

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
}

const PROVIDER_ORDER: AgentProviderId[] = ['codex-cli', 'claude-code', 'antigravity'];

const PROVIDER_SETUP: Record<AgentProviderId, { title: string; subtitle: string }> = {
  'codex-cli': { title: 'Codex', subtitle: 'Use your local Codex CLI installation' },
  'claude-code': { title: 'Claude Code', subtitle: 'Use your local Claude Code installation' },
  antigravity: { title: 'Antigravity', subtitle: 'High priority · connection path under review' },
  opencode: { title: 'OpenCode', subtitle: 'Not available in this workflow yet' },
  openclaw: { title: 'OpenClaw', subtitle: 'Not available in this workflow yet' },
  ollama: { title: 'Ollama', subtitle: 'Not available in this workflow yet' },
  kiro: { title: 'Kiro', subtitle: 'Not available in this workflow yet' },
  api: { title: 'API connection', subtitle: 'Not available in this workflow yet' },
  mcp: { title: 'MCP connection', subtitle: 'Not available in this workflow yet' },
};

const RUNNING_STATUSES = new Set(['queued', 'starting', 'running', 'waiting_for_approval', 'stopping']);

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
}) => {
  const dark = theme !== 'light';
  const conversations = useMemo(
    () => [...(project.agentConversations || [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [project.agentConversations],
  );
  const [conversationId, setConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [newProviderId, setNewProviderId] = useState<AgentProviderId>('codex-cli');
  const [prompt, setPrompt] = useState('');
  const [taskId, setTaskId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const providerCardsRef = useRef<HTMLDivElement>(null);
  const firstPromptRef = useRef<HTMLTextAreaElement>(null);
  const startRunButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (conversationId && !conversations.some((item) => item.id === conversationId)) {
      setConversationId(conversations[0]?.id || null);
    }
  }, [conversationId, conversations]);

  const activeConversation = conversations.find((item) => item.id === conversationId) || null;
  useEffect(() => {
    setTaskId(activeConversation?.taskId || '');
  }, [activeConversation?.id]);

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
  const readyProviders = providerStatuses.filter((item) => item.capabilities.canStartRun);
  const guidedStep = !isDesktopApp || !project.folderPath || !providerStatus?.capabilities.canStartRun
    ? 1
    : prompt.trim()
      ? 3
      : 2;
  const guidedAction = !isDesktopApp
    ? null
    : !project.folderPath
      ? { label: 'Open project library', title: 'Choose a local project folder', detail: 'Use Open Local Folder to create or open a project from the folder you want to work on.' }
      : !providerStatuses.length || isCheckingProviders
        ? { label: isCheckingProviders ? 'Checking…' : 'Check installs', title: 'Check for a local agent', detail: 'Formative looks for the Codex and Claude Code commands on this computer. It does not check account sign-in.' }
        : !providerStatus?.capabilities.canStartRun
          ? readyProviders.length
            ? { label: 'Choose an agent', title: 'Choose an installed agent', detail: 'Select an installed provider below. Each conversation stays with the provider you choose.' }
            : { label: 'Review provider setup', title: 'Install a local agent', detail: 'Install Codex CLI or Claude Code, then check installs again. Formative does not install agents or inspect sign-in.' }
          : !prompt.trim()
            ? { label: 'Write a question', title: 'Ask about this project', detail: 'Use everyday language. Your first conversation can read project files but cannot change them.' }
            : { label: 'Focus start button', title: 'Start a read-only chat', detail: 'Review the provider and project access notice, then choose when to send your message.' };

  const handleGuidedAction = () => {
    if (!isDesktopApp) return;
    if (!project.folderPath) {
      onOpenProjectLibrary();
    } else if (!providerStatuses.length || isCheckingProviders) {
      if (!isCheckingProviders) onRefreshProviders();
    } else if (!providerStatus?.capabilities.canStartRun) {
      providerCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!prompt.trim()) {
      firstPromptRef.current?.focus();
      firstPromptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      startRunButtonRef.current?.focus();
      startRunButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setPrompt('');
    setTaskId('');
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
  const panel = dark ? 'bg-[#111114] border-[#27272a]' : 'bg-white border-zinc-200';
  const subtle = dark ? 'text-zinc-400' : 'text-zinc-600';
  const quiet = dark ? 'text-zinc-500' : 'text-zinc-500';

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${shell}`}>
      <div className={`flex min-h-0 flex-1 overflow-hidden border-t ${dark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
        <aside className={`flex w-[230px] shrink-0 flex-col border-r ${dark ? 'border-[#27272a] bg-[#0d0d0f]' : 'border-zinc-200 bg-[#fbfbfc]'}`} aria-label="Agent conversations">
          <div className="flex items-center justify-between gap-2 px-3 py-3">
            <div className="min-w-0">
              <h2 className="text-xs font-semibold">Conversations</h2>
              <p className={`mt-0.5 truncate text-[10px] ${quiet}`}>{project.name}</p>
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
              <div className={`rounded-lg border border-dashed px-3 py-4 text-center text-[11px] leading-5 ${dark ? 'border-[#303035] text-zinc-500' : 'border-zinc-300 text-zinc-500'}`}>
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
                  className={`mb-1 flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${selected
                    ? dark ? 'bg-[#252529] text-white' : 'bg-zinc-200/80 text-zinc-950'
                    : dark ? 'text-zinc-300 hover:bg-[#18181b]' : 'text-zinc-700 hover:bg-zinc-100'}`}
                >
                  <MessageSquareText className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${selected ? 'text-blue-500' : quiet}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium">{conversation.title}</span>
                    <span className={`mt-1 block truncate text-[10px] ${quiet}`}>{title}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className={`border-t px-3 py-2.5 text-[10px] leading-4 ${dark ? 'border-[#27272a]' : 'border-zinc-200'} ${quiet}`}>
            <div className="flex items-start gap-2">
              <FolderOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate" title={project.folderPath || 'No local project folder'}>{project.folderPath || 'No local folder selected'}</span>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="Agent chat workspace">
          {activeConversation ? (
            <>
              <div className={`flex min-h-[58px] items-center justify-between gap-3 border-b px-4 py-2.5 ${dark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${dark ? 'border-[#303036] bg-[#18181b]' : 'border-zinc-200 bg-zinc-50'}`}>
                    <Bot className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-sm font-semibold">{activeConversation.title}</h1>
                    <p className={`mt-0.5 text-[10px] ${subtle}`}>{PROVIDER_SETUP[activeConversation.providerId]?.title || 'Agent'} · {project.name}</p>
                  </div>
                </div>
                {currentRun ? (
                  <button
                    type="button"
                    onClick={() => { void onStopRun(currentRun.id); }}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${dark ? 'border-[#45454c] text-zinc-200 hover:bg-zinc-800' : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100'}`}
                  >
                    <Square className="h-3 w-3 fill-current" aria-hidden="true" /> Stop run
                  </button>
                ) : (
                  <span className={`hidden shrink-0 items-center gap-1.5 text-[10px] sm:flex ${subtle}`}>
                    <Activity className={`h-3.5 w-3.5 ${conversationReadinessLabel === 'Ready' ? 'text-emerald-500' : 'text-amber-500'}`} aria-hidden="true" /> {conversationReadinessLabel}
                  </span>
                )}
              </div>

              <div className={`flex items-start gap-2 border-b px-4 py-2 text-[10px] leading-4 ${dark ? 'border-[#27272a] bg-[#101013] text-zinc-400' : 'border-zinc-200 bg-[#fcfcfd] text-zinc-600'}`}>
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                <p>{accessNote(activeConversation.providerId, Boolean(taskId))}</p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" role="log" aria-label="Conversation messages and agent progress">
                {conversationRuns.length === 0 ? (
                  <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
                    <div className={`mb-3 grid h-12 w-12 place-items-center rounded-2xl border ${dark ? 'border-[#303036] bg-[#151518]' : 'border-zinc-200 bg-white'}`}>
                      <Bot className="h-6 w-6 text-blue-500" aria-hidden="true" />
                    </div>
                    <h2 className="text-sm font-semibold">Start with a project question</h2>
                    <p className={`mt-1.5 text-xs leading-5 ${subtle}`}>Ask this agent to explain code or help you understand how the selected project works. Your first run is read-only.</p>
                  </div>
                ) : (
                  <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                    {conversationRuns.map((run) => {
                      const linkedTask = (project.issues || []).find((issue) => issue.id === run.taskId);
                      return (
                        <RunHistory
                          key={run.id}
                          run={run}
                          dark={dark}
                          taskLabel={linkedTask ? `${linkedTask.key} · ${linkedTask.title}` : undefined}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className={`shrink-0 border-t px-4 py-3 ${dark ? 'border-[#27272a] bg-[#0d0d0f]' : 'border-zinc-200 bg-white'}`}>
                {localError && (
                  <div role="alert" className="mx-auto mb-2 max-w-3xl rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-700 dark:text-rose-300">{localError}</div>
                )}
                <div className={`mx-auto max-w-3xl rounded-xl border shadow-sm ${dark ? 'border-[#36363c] bg-[#151518]' : 'border-zinc-300 bg-white'}`}>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder={project.folderPath ? 'Ask about this project…' : 'Choose a local project folder to start'}
                    aria-label="Message the agent"
                    maxLength={20000}
                    rows={2}
                    disabled={!project.folderPath || !providerStatus?.capabilities.canStartRun || Boolean(currentRun) || submitting}
                    className={`block max-h-36 min-h-[62px] w-full resize-y bg-transparent px-3.5 py-3 text-xs leading-5 outline-none placeholder:opacity-60 disabled:cursor-not-allowed ${dark ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-900 placeholder:text-zinc-500'}`}
                  />
                  <div className={`flex items-center justify-between gap-2 border-t px-2.5 py-2 ${dark ? 'border-[#303036]' : 'border-zinc-100'}`}>
                    <label className={`flex min-w-0 items-center gap-2 text-[10px] ${subtle}`}>
                      <span className="shrink-0">Link to task</span>
                      <select
                        value={taskId}
                        onChange={(event) => setTaskId(event.target.value)}
                        aria-label="Link this run to a project task"
                        className={`max-w-[240px] min-w-0 rounded-md border px-2 py-1 outline-none ${dark ? 'border-[#3a3a40] bg-[#202024] text-zinc-200' : 'border-zinc-200 bg-zinc-50 text-zinc-800'}`}
                      >
                        <option value="">No task</option>
                        {(project.issues || []).map((issue) => <option key={issue.id} value={issue.id}>{issue.key} · {issue.title}</option>)}
                      </select>
                    </label>
                    <button
                      type="submit"
                      disabled={!prompt.trim() || !canStartRun || Boolean(currentRun) || submitting}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {submitting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
                      {submitting ? 'Starting…' : 'Send'}
                    </button>
                  </div>
                </div>
                <p className={`mx-auto mt-1.5 max-w-3xl text-right text-[9px] ${quiet}`}>Ctrl/⌘ + Enter to send · read-only run</p>
              </form>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5">
              <div className="mx-auto w-full max-w-3xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-semibold tracking-tight">Start an agent conversation</h1>
                    <p className={`mt-1 text-xs ${subtle}`}>Choose an installed agent for {project.name}.</p>
                  </div>
                  {isDesktopApp ? (
                    <button
                      type="button"
                      onClick={onRefreshProviders}
                      disabled={isCheckingProviders}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors disabled:opacity-50 ${dark ? 'border-[#38383e] text-zinc-300 hover:bg-zinc-800' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'}`}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isCheckingProviders ? 'animate-spin' : ''}`} aria-hidden="true" />
                      Check installs
                    </button>
                  ) : (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${dark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                      Desktop app required
                    </span>
                  )}
                </div>

                <div className={`mt-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[11px] leading-5 ${dark ? 'border-emerald-900/60 bg-emerald-950/20 text-zinc-300' : 'border-emerald-200 bg-emerald-50/70 text-zinc-700'}`}>
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  <p><strong className={dark ? 'text-zinc-100' : 'text-zinc-900'}>Read-only first.</strong> {accessNote(providerId, Boolean(taskId))}</p>
                </div>

                <section aria-label="First conversation walkthrough" className={`mt-4 grid gap-px overflow-hidden rounded-xl border sm:grid-cols-3 ${dark ? 'border-[#303036] bg-[#303036]' : 'border-zinc-200 bg-zinc-200'}`}>
                  {[
                    {
                      title: 'Choose an agent',
                      detail: providerStatus?.capabilities.canStartRun ? 'Your selection is ready.' : 'Choose an installed provider below.',
                      complete: Boolean(providerStatus?.capabilities.canStartRun),
                    },
                    {
                      title: 'Describe your question',
                      detail: prompt.trim() ? 'Your first message is ready.' : 'Ask about this project in plain language.',
                      complete: Boolean(prompt.trim()),
                    },
                    {
                      title: 'Review the answer',
                      detail: (project.agentRuns || []).some((run) => ['completed', 'failed', 'cancelled'].includes(run.status))
                        ? 'A real run is saved with this project.'
                        : 'Follow progress, then continue the conversation.',
                      complete: (project.agentRuns || []).some((run) => ['completed', 'failed', 'cancelled'].includes(run.status)),
                    },
                  ].map((step, index) => (
                    <div key={step.title} className={`flex items-start gap-2.5 px-3 py-2.5 ${dark ? 'bg-[#111114]' : 'bg-white'}`}>
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${step.complete
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                        : dark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                        {step.complete ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                      </span>
                      <span>
                        <span className={`block text-[10px] font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>{step.title}</span>
                        <span className={`mt-0.5 block text-[9px] leading-4 ${quiet}`}>{step.detail}</span>
                      </span>
                    </div>
                  ))}
                </section>

                {!project.folderPath && (
                  <div className={`mt-3 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[11px] leading-5 ${dark ? 'border-amber-900/50 bg-amber-950/20 text-amber-100/80' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                    <FolderOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{isDesktopApp ? 'This project has no local folder. Open or scan the project folder you want to work with before starting an agent.' : 'Open the desktop app and choose a project created from a local folder before starting an agent.'}</p>
                  </div>
                )}

                {guidedAction && (
                  <section aria-label="Guided first run" aria-live="polite" className={`mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border px-3.5 py-3 sm:flex-row sm:items-center ${dark ? 'border-blue-900/50 bg-blue-950/15' : 'border-blue-200 bg-blue-50/70'}`}>
                    <div className="min-w-0">
                      <p className={`text-[9px] font-semibold uppercase tracking-wider ${dark ? 'text-blue-300' : 'text-blue-700'}`}>Step {guidedStep} of 3</p>
                      <h2 className={`mt-0.5 text-xs font-semibold ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>{guidedAction.title}</h2>
                      <p className={`mt-0.5 text-[10px] leading-4 ${subtle}`}>{guidedAction.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGuidedAction}
                      disabled={guidedAction.label === 'Checking…'}
                      className={`inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-55 ${dark ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-blue-700 text-white hover:bg-blue-600'}`}
                    >
                      {guidedAction.label}
                    </button>
                  </section>
                )}

                <div ref={providerCardsRef} className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {PROVIDER_ORDER.map((provider) => {
                    const status = providerStatuses.find((item) => item.providerId === provider);
                    const supported = Boolean(status?.capabilities.canStartRun);
                    const selected = provider === newProviderId;
                    const disabled = !supported || !project.folderPath;
                    return (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => { if (!disabled) setNewProviderId(provider); }}
                        aria-pressed={selected}
                        disabled={disabled}
                        className={`rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-65 ${selected && supported
                          ? dark ? 'border-blue-500/70 bg-blue-500/10' : 'border-blue-500 bg-blue-50/70'
                          : dark ? 'border-[#303036] bg-[#121215] hover:border-[#4a4a52]' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${dark ? 'border-[#36363c] bg-[#1c1c20]' : 'border-zinc-200 bg-zinc-50'}`}>
                            <Bot className={`h-4 w-4 ${supported ? 'text-blue-500' : quiet}`} aria-hidden="true" />
                          </div>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold">{PROVIDER_SETUP[provider].title}</span>
                            <span className={`mt-0.5 block text-[10px] ${subtle}`}>{PROVIDER_SETUP[provider].subtitle}</span>
                          </span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${status?.state === 'installed'
                            ? dark ? 'bg-emerald-950/50 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                            : dark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
                            {provider === 'antigravity'
                              ? 'Under review'
                              : !isDesktopApp
                                ? 'Desktop app'
                                : status?.state === 'installed'
                                  ? 'Installed'
                                  : status?.state === 'missing'
                                    ? 'Not installed'
                                    : isCheckingProviders
                                      ? 'Checking'
                                      : 'Not checked'}
                          </span>
                        </div>
                        {provider === 'antigravity' ? (
                          <p className={`mt-2 text-[10px] leading-4 ${quiet}`}>High priority. Google currently does not support third-party apps wrapping the headless CLI on consumer plans, so Formative keeps this unavailable while we check for an approved connection method.</p>
                        ) : !isDesktopApp ? (
                          <p className={`mt-2 text-[10px] leading-4 ${quiet}`}>Open Formative desktop to check and use this local provider.</p>
                        ) : status?.state === 'installed' ? (
                          <p className={`mt-2 text-[10px] leading-4 ${quiet}`}>{status.version ? `${status.version} · ` : ''}Your account is checked only when a run starts.</p>
                        ) : (
                          <p className={`mt-2 text-[10px] leading-4 ${quiet}`}>{status?.explanation || 'Choose Check installs to look for this local command.'}</p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {!providerStatuses.length && (
                  <div className={`mt-3 rounded-lg border border-dashed px-3 py-2.5 text-[11px] ${dark ? 'border-[#34343a] text-zinc-400' : 'border-zinc-300 text-zinc-600'}`}>
                    {!isDesktopApp
                      ? 'Local provider checks are available in Formative desktop.'
                      : isCheckingProviders
                        ? 'Checking for local agent installations…'
                        : 'Local agent availability has not been checked yet.'}
                  </div>
                )}

                {providerStatus?.capabilities.canStartRun && (
                  <form onSubmit={handleSubmit} className={`mt-4 rounded-xl border p-3 ${panel}`}>
                    <label htmlFor="agent-first-prompt" className="text-xs font-semibold">What would you like to understand?</label>
                    <textarea
                      id="agent-first-prompt"
                      ref={firstPromptRef}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder="For example: Explain how this app saves project settings."
                      maxLength={20000}
                      rows={3}
                      disabled={!canStartRun || submitting}
                      className={`mt-2 block w-full resize-y rounded-lg border px-3 py-2.5 text-xs leading-5 outline-none focus:border-blue-500 disabled:cursor-not-allowed ${dark ? 'border-[#37373d] bg-[#17171a] text-zinc-100 placeholder:text-zinc-500' : 'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-500'}`}
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <label className={`flex min-w-0 items-center gap-2 text-[10px] ${subtle}`}>
                        <span className="shrink-0">Link to task</span>
                        <select
                          value={taskId}
                          onChange={(event) => setTaskId(event.target.value)}
                          aria-label="Link this run to a project task"
                          className={`max-w-[280px] min-w-0 rounded-md border px-2 py-1 outline-none ${dark ? 'border-[#3a3a40] bg-[#202024] text-zinc-200' : 'border-zinc-200 bg-zinc-50 text-zinc-800'}`}
                        >
                          <option value="">No task</option>
                          {(project.issues || []).map((issue) => <option key={issue.id} value={issue.id}>{issue.key} · {issue.title}</option>)}
                        </select>
                      </label>
                      <button
                        ref={startRunButtonRef}
                        type="submit"
                        disabled={!prompt.trim() || !canStartRun || submitting}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {submitting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
                        {submitting ? 'Starting…' : 'Start read-only chat'}
                      </button>
                    </div>
                    {localError && <p role="alert" className="mt-2 text-[11px] text-rose-600 dark:text-rose-300">{localError}</p>}
                    <p className={`mt-2 text-right text-[9px] ${quiet}`}>Ctrl/⌘ + Enter to start</p>
                  </form>
                )}

                {providerStatus?.state === 'installed' && providerStatus.authentication === 'not_checked' && (
                  <p className={`mt-3 flex items-center gap-1.5 text-[10px] ${quiet}`}><Clock3 className="h-3 w-3" aria-hidden="true" />Installation is detected; Formative does not inspect sign-in state.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function RunHistory({ run, dark, taskLabel }: { run: AgentRun; dark: boolean; taskLabel?: string }) {
  const assistantEvents = run.events.filter((event) => event.type === 'assistant_message');
  const statusEvents = run.events.filter((event) => event.type !== 'assistant_message' && event.type !== 'prompt');
  return (
    <article className="flex flex-col gap-3">
      <div className="flex justify-end">
        <div className={`max-w-[88%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-xs leading-5 ${dark ? 'bg-[#25252a] text-zinc-100' : 'bg-blue-50 text-zinc-900'}`}>
          {taskLabel && <p className={`mb-1 truncate text-[9px] font-medium ${dark ? 'text-blue-300' : 'text-blue-700'}`}>Linked task · {taskLabel}</p>}
          <p className="whitespace-pre-wrap break-words">{run.prompt}</p>
          <p className={`mt-1 text-right text-[9px] ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>{formatTime(run.createdAt)}</p>
        </div>
      </div>

      {statusEvents.length > 0 && (
        <ol className="ml-2 flex flex-col gap-1.5 border-l border-dashed border-zinc-300 py-0.5 pl-3 dark:border-zinc-700" aria-label="Agent progress">
          {statusEvents.map((event) => {
            const label = eventLabel(event);
            if (!label) return null;
            return (
              <li key={event.id} className={`flex items-start gap-1.5 text-[10px] leading-4 ${event.type === 'warning' || event.type === 'error' ? dark ? 'text-amber-300' : 'text-amber-800' : dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {event.type === 'completed' ? <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" aria-hidden="true" /> : event.type === 'error' ? <CircleAlert className="mt-0.5 h-3 w-3 shrink-0 text-rose-500" aria-hidden="true" /> : <Activity className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />}
                <span>{label}</span>
                <span className="ml-auto shrink-0 opacity-70">{formatTime(event.occurredAt)}</span>
              </li>
            );
          })}
        </ol>
      )}

      {assistantEvents.map((event) => (
        <div key={event.id} className="flex justify-start">
          <div className={`max-w-[92%] rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-xs leading-5 ${dark ? 'border-[#303036] bg-[#151518] text-zinc-200' : 'border-zinc-200 bg-white text-zinc-800'}`}>
            <p className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-blue-500"><Bot className="h-3 w-3" aria-hidden="true" />Agent</p>
            <p className="whitespace-pre-wrap break-words">{event.details || event.summary}</p>
          </div>
        </div>
      ))}

      {!assistantEvents.length && RUNNING_STATUSES.has(run.status) && (
        <div role="status" className={`flex items-center gap-2 pl-1 text-[10px] ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue-500" aria-hidden="true" />
          <span>Agent is working…</span>
        </div>
      )}

      <div className={`flex items-center gap-1.5 pl-1 text-[9px] ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
        <StatusMark status={run.status} dark={dark} />
        <span className="capitalize">{run.status.replaceAll('_', ' ')}</span>
        {run.finishedAt && <span>· {formatTime(run.finishedAt)}</span>}
      </div>
    </article>
  );
}
