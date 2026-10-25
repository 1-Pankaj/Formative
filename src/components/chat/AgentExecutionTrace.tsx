import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  ChevronDown,
  ChevronRight,
  FileCode,
  Search,
  Terminal,
} from '../ui/FormativeGlyphs';
import type { AgentRunEvent, AgentRunStatus } from '../../types/agentRuns';

interface AgentExecutionTraceProps {
  events: AgentRunEvent[];
  status: AgentRunStatus;
  dark: boolean;
  formatTime: (iso: string) => string;
}

export const AgentExecutionTrace: React.FC<AgentExecutionTraceProps> = ({
  events,
  status,
  dark,
  formatTime,
}) => {
  const isRunning = ['queued', 'starting', 'running', 'waiting_for_approval', 'stopping'].includes(status);
  // Auto-expand while running, default collapsed when completed to keep chat focused on answer
  const [isOpen, setIsOpen] = useState(isRunning);

  if (events.length === 0) return null;

  const toolSteps = events.filter((e) => e.type !== 'assistant_message' && e.type !== 'prompt');
  if (toolSteps.length === 0) return null;

  const latestStep = toolSteps[toolSteps.length - 1];

  const getStepIcon = (event: AgentRunEvent) => {
    if (event.type === 'completed') return <CheckCircle2 className="w-4 h-4 text-zinc-400" />;
    if (event.type === 'error') return <CircleAlert className="w-4 h-4 text-rose-500" />;
    if (event.toolName === 'Read' || event.relativePaths?.length) {
      return <FileCode className="w-4 h-4 text-blue-400" />;
    }
    if (event.toolName === 'Grep' || event.toolName === 'Glob') {
      return <Search className="w-4 h-4 text-purple-400" />;
    }
    if (event.toolName === 'Command') {
      return <Terminal className="w-4 h-4 text-amber-400" />;
    }
    return <Activity className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className={`my-2 rounded-xl border text-xs overflow-hidden transition-all ${
      dark ? 'border-[#2c2c32] bg-[#121215]' : 'border-zinc-200 bg-zinc-50/70'
    }`}>
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left select-none transition-colors ${
          dark ? 'hover:bg-[#18181d]' : 'hover:bg-zinc-100'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-zinc-400">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
          <Terminal className="w-4 h-4 text-brand shrink-0" />
          <span className="font-semibold text-inherit truncate">
            {isRunning ? 'Agent Execution in Progress' : 'Agent Execution Steps'}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            dark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'
          }`}>
            {toolSteps.length}
          </span>
        </div>

        {!isOpen && (
          <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[280px] ml-2">
            {latestStep.summary}
          </span>
        )}
      </button>

      {/* Expanded Trace Feed */}
      {isOpen && (
        <div className={`px-3.5 pb-2.5 pt-1 border-t space-y-1.5 ${
          dark ? 'border-[#222227]' : 'border-zinc-200/80'
        }`}>
          {toolSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-2 py-1 text-[12px] leading-relaxed rounded px-1.5 transition-colors ${
                dark ? 'hover:bg-zinc-800/40 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <span className="mt-0.5 shrink-0">{getStepIcon(step)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {step.toolName && (
                    <span className={`px-1 py-0.2 rounded font-mono text-[10px] font-semibold uppercase ${
                      dark ? 'bg-[#222228] text-brand border border-brand/20' : 'bg-zinc-200 text-brand'
                    }`}>
                      {step.toolName}
                    </span>
                  )}
                  <span className="font-medium">{step.summary}</span>
                </div>
                {step.relativePaths && step.relativePaths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {step.relativePaths.map((p, idx) => (
                      <span
                        key={idx}
                        className={`inline-block font-mono text-[11px] px-1.5 py-0.5 rounded ${
                          dark ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
                {step.details && !step.relativePaths?.includes(step.details) && step.details !== step.summary && (
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate">
                    {step.details}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                {formatTime(step.occurredAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
