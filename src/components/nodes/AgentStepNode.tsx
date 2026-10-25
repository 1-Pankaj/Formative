import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Bot, 
  User, 
  Wrench, 
  Brain,
  ChevronDown,
  ChevronUp
} from '../ui/FormativeGlyphs';
import { ArchNodeData } from '../../types';

interface AgentStepNodeProps {
  id: string;
  data: ArchNodeData;
  selected?: boolean;
}

export const AgentStepNode: React.FC<AgentStepNodeProps> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isUser = data.category === 'service' || data.label?.includes('User') || data.label?.includes('Instruction');
  const isRunning = data.status === 'running';
  const isDone = data.status === 'done';
  const isError = data.status === 'error';

  return (
    <div
      className={`group relative w-92 rounded border transition-all select-none shadow-sm ${
        selected
          ? 'border-[#E04418] ring-1 ring-[#E04418]'
          : isRunning
          ? 'border-amber-500/80'
          : 'border-[#3e3e42] hover:border-[#E04418]'
      } bg-[#252526] text-[#cccccc]`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#E04418] !border !border-[#1e1e1e] hover:!scale-150 transition-transform"
      />

      {/* Header Telemetry Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#1e1e1e] border-b border-[#3e3e42] rounded-t">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#2d2d2d] text-white border border-[#3e3e42]">
            {data.stepIndex ? `STEP ${String(data.stepIndex).padStart(2, '0')}` : 'STEP'}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            {isUser ? <User className="w-3.5 h-3.5 text-[#858585]" /> : <Bot className="w-3.5 h-3.5 text-[#E04418]" />}
            <span className="truncate max-w-[170px]">{data.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          {isRunning && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Active
            </span>
          )}
          {isDone && (
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Done
            </span>
          )}
          {isError && (
            <span className="flex items-center gap-1 text-rose-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Error
            </span>
          )}
        </div>
      </div>

      {/* Tool Execution Card */}
      {data.toolUsed && (
        <div className="p-2.5 bg-[#1e1e1e] border-b border-[#3e3e42] space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-white font-medium">
            <Wrench className="w-3.5 h-3.5 text-[#E04418]" />
            <span>Invoked: <code className="text-[#9cdcfe]">{data.toolUsed}</code></span>
          </div>

          {data.argsPreview && (
            <div className="p-2 rounded bg-[#181818] border border-[#2d2d2d] font-mono text-[11px] text-[#858585] overflow-hidden text-ellipsis line-clamp-3">
              {data.argsPreview}
            </div>
          )}
        </div>
      )}

      {/* Clean Parsed Summary */}
      {data.description && (
        <div className="p-3 text-xs text-[#cccccc] leading-relaxed font-sans border-b border-[#3e3e42]">
          {data.description}
        </div>
      )}

      {/* Expandable Thinking Section */}
      {data.thought && (
        <div className="p-2.5 bg-[#1e1e1e] rounded-b">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-[11px] text-[#858585] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-1.5 font-mono">
              <Brain className="w-3.5 h-3.5 text-[#dcdcaa]" />
              <span>Agent Thought / Chain</span>
            </div>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 p-2 rounded bg-[#181818] border border-[#2d2d2d] text-[11px] font-mono text-[#858585] whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
              {data.thought}
            </div>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#E04418] !border !border-[#1e1e1e] hover:!scale-150 transition-transform"
      />
    </div>
  );
};
