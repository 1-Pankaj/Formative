import React, { useState } from 'react';
import type { AgentRun, AgentProviderId } from '../../types/agentRuns';
import type { Project, ThemeMode } from '../../types';
import { getProjectOfficeTeam } from '../office/officeCast';
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Square,
  Terminal,
} from '../ui/FormativeGlyphs';

interface AgentRunDockProps {
  runs: AgentRun[];
  project: Project;
  theme: ThemeMode;
  onOpenRun: (conversationId: string, taskId?: string) => void;
  onStopRun: (runId: string) => Promise<void>;
}

const PROVIDER_NAMES: Record<AgentProviderId, string> = {
  'codex-cli': 'Codex CLI',
  'claude-code': 'Claude Code',
  opencode: 'OpenCode',
  antigravity: 'Antigravity',
  openclaw: 'OpenClaw',
  ollama: 'Ollama',
  kiro: 'Kiro',
  api: 'API',
  mcp: 'MCP',
};

export const AgentRunDock: React.FC<AgentRunDockProps> = ({
  runs,
  project,
  theme,
  onOpenRun,
  onStopRun,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRunIndex, setSelectedRunIndex] = useState(0);
  const isDark = theme !== 'light';

  if (!runs || runs.length === 0) return null;

  const activeIndex = selectedRunIndex < runs.length ? selectedRunIndex : 0;
  const activeRun = runs[activeIndex];
  if (!activeRun) return null;

  const officeTeam = getProjectOfficeTeam(project.officeConfig);
  const allEmployees = [officeTeam.ceo, ...officeTeam.employees];
  const assignedEmployee = allEmployees.find((e) => e.id === activeRun.employeeId);

  const linkedTask = (project.issues || []).find((i) => i.id === activeRun.taskId);
  const taskLabel = linkedTask ? `${linkedTask.key}: ${linkedTask.title}` : activeRun.displayPrompt || activeRun.prompt;

  const latestEvent = activeRun.events.length > 0 ? activeRun.events[activeRun.events.length - 1] : null;
  const eventSummary = latestEvent
    ? [latestEvent.summary, latestEvent.relativePaths?.length ? latestEvent.relativePaths.join(', ') : ''].filter(Boolean).join(' - ')
    : 'Initializing provider session...';

  const providerLabel = PROVIDER_NAMES[activeRun.providerId] || activeRun.providerId;

  if (isCollapsed) {
    return (
      <aside
        aria-label="Background agent run indicator"
        className={`fixed bottom-4 right-5 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-102 ${
          isDark
            ? 'bg-[#121318]/95 border-emerald-500/30 text-zinc-100 hover:border-emerald-500/50'
            : 'bg-white/95 border-emerald-600/30 text-zinc-900 hover:border-emerald-600/50 shadow-zinc-900/10'
        }`}
        onClick={() => setIsCollapsed(false)}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-xs font-bold text-emerald-400">{providerLabel}</span>
        <span className="text-xs text-zinc-400 truncate max-w-[200px]">
          {assignedEmployee ? `${assignedEmployee.name} - ` : ''}{taskLabel}
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-zinc-400 ml-1" />
      </aside>
    );
  }

  return (
    <aside
      aria-label="Background agent execution monitor"
      className={`fixed bottom-4 right-5 z-40 w-[min(460px,calc(100vw-2rem))] rounded-2xl border shadow-2xl backdrop-blur-md overflow-hidden transition-all ${
        isDark
          ? 'bg-[#121318]/95 border-zinc-700/80 shadow-black/80 text-zinc-100'
          : 'bg-white/95 border-zinc-300 shadow-zinc-900/20 text-zinc-900'
      }`}
    >
      {/* Header */}
      <div
        className={`px-3.5 py-2.5 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800 bg-[#16171e]/90' : 'border-zinc-200 bg-zinc-50/90'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>AI Background Agent Running</span>
          </span>
          {runs.length > 1 && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
              {activeIndex + 1}/{runs.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            title="Minimize monitor dock"
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-3">
        {/* Provider & Teammate Meta */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                activeRun.providerId === 'codex-cli'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
              }`}
            >
              {providerLabel}
            </span>

            {assignedEmployee && (
              <span className="text-xs font-medium text-zinc-300 truncate">
                for <strong className="text-white font-semibold">{assignedEmployee.name}</strong> ({assignedEmployee.roleTitle})
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-zinc-400 shrink-0">
            Status: <span className="text-emerald-400 capitalize">{activeRun.status}</span>
          </span>
        </div>

        {/* Task Title */}
        <div className={`p-2.5 rounded-xl border text-xs ${
          isDark ? 'bg-zinc-950/70 border-zinc-800/80' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">Task in Progress</div>
          <p className="font-medium text-sm leading-snug line-clamp-2 text-zinc-100 dark:text-zinc-100">
            {taskLabel}
          </p>
        </div>

        {/* Live Terminal / Trace Stream Output */}
        <div className={`px-2.5 py-2 rounded-xl border text-xs font-mono flex items-start gap-2 ${
          isDark ? 'bg-[#09090b] border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
        }`}>
          <Terminal className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" />
          <p className="truncate text-[11px] text-zinc-300 leading-relaxed">
            {eventSummary}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onOpenRun(activeRun.conversationId, activeRun.taskId)}
            className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Trace & Chat</span>
          </button>

          <button
            type="button"
            onClick={() => void onStopRun(activeRun.id)}
            title="Stop this agent run"
            className="h-8 px-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Square className="w-3 h-3 text-red-400" />
            <span>Stop Run</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
