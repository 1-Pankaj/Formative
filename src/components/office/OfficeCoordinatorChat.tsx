import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Project, ProjectOfficeTeam, ThemeMode } from '../../types';
import type { AgentProviderId, AgentProviderStatus, AgentRun, AgentRunEvent } from '../../types/agentRuns';
import type { StartChatRun } from '../AgentChatView';
import { useOfficeModalAccessibility } from './useOfficeModalAccessibility';

interface OfficeCoordinatorChatProps {
  project: Project;
  team: ProjectOfficeTeam;
  theme: ThemeMode;
  providerStatuses: AgentProviderStatus[];
  isCheckingProviders: boolean;
  onRefreshProviders: () => void;
  onStartRun: (request: StartChatRun) => Promise<{ success: boolean; error?: string }>;
  onStopRun: (runId: string) => Promise<void>;
  onClose: () => void;
}

const PROVIDERS: { id: AgentProviderId; title: string }[] = [
  { id: 'codex-cli', title: 'Codex CLI' },
  { id: 'claude-code', title: 'Claude Code CLI' },
];
const RUNNING = new Set<AgentRun['status']>(['queued', 'starting', 'running', 'waiting_for_approval', 'stopping']);

function localId() {
  return `office-coordinator-${globalThis.crypto.randomUUID()}`;
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function responseText(event: AgentRunEvent) {
  return event.details?.trim() || event.summary;
}

export const OfficeCoordinatorChat: React.FC<OfficeCoordinatorChatProps> = ({
  project,
  team,
  theme,
  providerStatuses,
  isCheckingProviders,
  onRefreshProviders,
  onStartRun,
  onStopRun,
  onClose,
}) => {
  const dark = theme !== 'light';
  const eligibleStatuses = providerStatuses.filter((item) => item.providerId === 'codex-cli' || item.providerId === 'claude-code');
  const [providerId, setProviderId] = useState<AgentProviderId>(team.ceo.preferredProviderId === 'claude-code' ? 'claude-code' : 'codex-cli');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [forceNewConversation, setForceNewConversation] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useOfficeModalAccessibility(true, dialogRef, onClose);

  const conversations = useMemo(() => (project.agentConversations || [])
    .filter((conversation) => (conversation.employeeId || team.ceo.id) === team.ceo.id && PROVIDERS.some((provider) => provider.id === conversation.providerId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [project.agentConversations, team.ceo.id]);

  useEffect(() => {
    if (conversationId && !conversations.some((conversation) => conversation.id === conversationId)) {
      setConversationId(conversations[0]?.id || null);
      return;
    }
    if (!conversationId && !forceNewConversation && conversations.length) setConversationId(conversations[0].id);
  }, [conversationId, conversations, forceNewConversation]);

  const activeConversation = conversations.find((conversation) => conversation.id === conversationId) || null;
  const selectedProviderId = activeConversation?.providerId || providerId;
  const selectedTaskId = (project.issues || []).some((issue) => issue.id === taskId) ? taskId : '';
  const providerStatus = eligibleStatuses.find((item) => item.providerId === selectedProviderId);
  const providerReady = Boolean(providerStatus?.state === 'installed' && providerStatus.capabilities.canStartRun);
  const canStart = Boolean(project.folderPath && window.formativeApi && providerReady);
  const runs = useMemo(() => activeConversation
    ? (project.agentRuns || []).filter((run) => run.conversationId === activeConversation.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [], [activeConversation, project.agentRuns]);
  const currentRun = [...runs].reverse().find((run) => RUNNING.has(run.status)) || null;

  useEffect(() => {
    setTaskId(activeConversation?.taskId || '');
  }, [activeConversation?.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim() || !canStart || submitting || currentRun) return;
    const conversation = activeConversation?.id || localId();
    const selectedTask = (project.issues || []).find((issue) => issue.id === selectedTaskId);
    const otherTasks = (project.issues || []).filter((issue) => issue.status !== 'done').slice(0, 8);
    const groundedPrompt = selectedTask
      ? [
          `You are the project coordinator for ${project.name}. Answer the user's question using the selected task and the read-only project files when useful. Be clear about what the task records do and do not establish. Do not claim that an agent is working unless Formative shows a real active run.`,
          '',
          `User's question: ${prompt.trim()}`,
        ].join('\n')
      : [
          `You are the project coordinator for ${project.name}. Answer using the current project task records and read-only project files when useful. Be clear about missing or stale information. Do not claim that an agent is working unless Formative shows a real active run.`,
          '',
          `Open project tasks (${otherTasks.length}${(project.issues || []).filter((issue) => issue.status !== 'done').length > 8 ? ' of more' : ''}):`,
          ...(otherTasks.length ? otherTasks.map((issue) => `- ${issue.key}: ${issue.title} [${issue.status}]${issue.description ? ` — ${issue.description.slice(0, 240)}` : ''}`) : ['- No open tasks are recorded.']),
          '',
          `User's question: ${prompt.trim()}`,
        ].join('\n');

    setSubmitting(true);
    setError(null);
    try {
      const result = await onStartRun({
        providerId: selectedProviderId,
        conversationId: conversation,
        prompt: groundedPrompt,
        displayPrompt: prompt.trim(),
        title: prompt.trim(),
        employeeId: team.ceo.id,
        ...(selectedTaskId ? { taskId: selectedTaskId } : {}),
      });
      setConversationId(conversation);
      setForceNewConversation(false);
      if (!result.success) setError(result.error || 'Formative could not start the coordinator conversation.');
      else setPrompt('');
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Formative could not start the coordinator conversation.');
    } finally {
      setSubmitting(false);
    }
  };

  const shell = dark ? 'border-[#27272a] bg-[#121215] text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950';
  const quiet = dark ? 'text-zinc-400' : 'text-zinc-600';
  const input = dark ? 'border-[#3a3a40] bg-[#09090b] text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900';
  const primary = dark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-700';

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="office-coordinator-title" className={`flex max-h-[min(820px,94vh)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border shadow-2xl outline-none ${shell}`}>
        <header className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${dark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
          <div className="min-w-0">
            <h2 id="office-coordinator-title" className="text-base font-semibold">Talk to {team.ceo.name}</h2>
            <p className={`mt-1 text-sm ${quiet}`}>A real, read-only conversation with the local agent you choose, grounded in this project’s tasks.</p>
          </div>
          <button type="button" onClick={onClose} className={`shrink-0 rounded px-2 py-1 text-sm ${quiet}`}>Close</button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {conversations.length > 0 && (
            <div className={`mb-4 flex flex-wrap items-end gap-2 border-b pb-4 ${dark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
              <label className="min-w-[220px] flex-1">
                <span className={`mb-1 block text-xs font-medium ${quiet}`}>Conversation history</span>
                <select value={activeConversation?.id || ''} onChange={(event) => {
                  setConversationId(event.target.value || null);
                  setForceNewConversation(!event.target.value);
                  setPrompt('');
                  setError(null);
                }} className={`h-9 w-full rounded-md border px-3 text-sm ${input}`}>
                  <option value="">New conversation</option>
                  {conversations.map((conversation) => <option key={conversation.id} value={conversation.id}>{conversation.title}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => {
                setConversationId(null);
                setForceNewConversation(true);
                setTaskId('');
                setPrompt('');
                setError(null);
              }} className={`h-9 rounded-md border px-3 text-xs font-medium ${dark ? 'border-[#3a3a40] text-zinc-200 hover:bg-[#202024]' : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100'}`}>
                New conversation
              </button>
            </div>
          )}
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={`mb-1 block text-xs font-medium ${quiet}`}>Local agent</span>
              <select value={selectedProviderId} disabled={Boolean(activeConversation)} onChange={(event) => setProviderId(event.target.value as AgentProviderId)} className={`h-9 w-full rounded-md border px-3 text-sm ${input} disabled:opacity-70`}>
                {PROVIDERS.map((provider) => <option key={provider.id} value={provider.id}>{provider.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={`mb-1 block text-xs font-medium ${quiet}`}>Task context</span>
              <select value={selectedTaskId} onChange={(event) => setTaskId(event.target.value)} className={`h-9 w-full rounded-md border px-3 text-sm ${input}`}>
                <option value="">Project overview and open tasks</option>
                {(project.issues || []).map((issue) => <option key={issue.id} value={issue.id}>{issue.key} · {issue.title}</option>)}
              </select>
            </label>
          </div>

          {!canStart && (
            <div className={`mb-4 rounded-lg border px-3.5 py-3 text-sm ${dark ? 'border-[#303036] bg-[#09090b]' : 'border-zinc-200 bg-zinc-50'}`}>
              <p>{!window.formativeApi ? 'Coordinator chat is available in the Formative desktop app.' : !project.folderPath ? 'Choose a local project folder before starting a conversation.' : providerReady ? '' : providerStatus?.explanation || (isCheckingProviders ? 'Checking local agent availability…' : 'The selected local agent is not ready yet.')}</p>
              {!providerReady && (
                <button type="button" onClick={onRefreshProviders} disabled={isCheckingProviders} className={`mt-2 rounded-md border px-2.5 py-1.5 text-xs font-medium ${dark ? 'border-[#3a3a40] text-zinc-200' : 'border-zinc-300 text-zinc-800'}`}>
                  {isCheckingProviders ? 'Checking…' : 'Check local agents'}
                </button>
              )}
            </div>
          )}

          {runs.length > 0 ? (
            <div className="space-y-4" aria-live="polite">
              {runs.slice(-8).map((run) => {
                const assistantMessages = run.events.filter((item) => item.type === 'assistant_message');
                const latestProgress = [...run.events].reverse().find((item) => item.type !== 'assistant_message' && item.type !== 'prompt');
                return (
                  <article key={run.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-5 ${dark ? 'bg-[#25252a] text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}>
                        <p className={`mb-1 text-[11px] ${quiet}`}>{formatTime(run.createdAt)} · You</p>
                        {run.prompt.split("User's question:").at(-1)?.trim() || run.prompt}
                      </div>
                    </div>
                    {assistantMessages.length > 0 ? assistantMessages.map((message) => (
                      <div key={message.id} className={`max-w-[92%] rounded-xl border px-3.5 py-2.5 text-sm leading-6 ${dark ? 'border-[#303036] bg-[#09090b]' : 'border-zinc-200 bg-white'}`}>
                        <p className={`mb-1 text-[11px] ${quiet}`}>{formatTime(message.occurredAt)} · {PROVIDERS.find((item) => item.id === run.providerId)?.title || 'Local agent'}</p>
                        <p className="whitespace-pre-wrap">{responseText(message)}</p>
                      </div>
                    )) : (
                      <div className={`max-w-[92%] rounded-xl border px-3.5 py-2.5 text-sm ${dark ? 'border-[#303036] bg-[#09090b]' : 'border-zinc-200 bg-white'}`}>
                        <p>{latestProgress?.summary || `Run ${run.status.replaceAll('_', ' ')}.`}</p>
                        <p className={`mt-1 text-xs ${quiet}`}>{run.status === 'running' ? 'Waiting for the agent’s next update.' : `Updated ${formatTime(run.updatedAt)}`}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-lg border border-dashed px-4 py-6 text-sm leading-6 ${dark ? 'border-[#303036] text-zinc-400' : 'border-zinc-300 text-zinc-600'}`}>
              Ask about a task, current progress, or the project. Formative sends the question and the selected task context to the local agent shown above. Provider usage and any charges follow your own account.
            </div>
          )}
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className={`shrink-0 border-t p-4 ${dark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
          {error && <p role="alert" className="mb-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
          {currentRun && (
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={`text-xs ${quiet}`}>A read-only run is active.</span>
              <button type="button" onClick={() => void onStopRun(currentRun.id)} className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${dark ? 'border-[#3a3a40] text-zinc-200' : 'border-zinc-300 text-zinc-800'}`}>Stop run</button>
            </div>
          )}
          <div className={`rounded-lg border ${dark ? 'border-[#36363c] bg-[#09090b]' : 'border-zinc-300 bg-white'}`}>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
            }} maxLength={20000} rows={3} aria-label="Message the project coordinator" placeholder="Ask about this project…" disabled={!canStart || Boolean(currentRun) || submitting} className={`block max-h-48 min-h-20 w-full resize-y bg-transparent px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-zinc-500 ${dark ? 'text-zinc-100' : 'text-zinc-900'}`} />
            <div className={`flex items-center justify-between gap-3 border-t px-3 py-2 ${dark ? 'border-[#303036]' : 'border-zinc-200'}`}>
              <span className={`text-xs ${quiet}`}>Read-only · Ctrl/⌘ + Enter to send</span>
              <button type="submit" disabled={!prompt.trim() || !canStart || Boolean(currentRun) || submitting} className={`min-h-9 rounded-md px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${primary}`}>
                {submitting ? 'Starting…' : currentRun ? 'Agent is working…' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};
