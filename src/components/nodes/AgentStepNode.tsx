/**
 * Formative Studio - Redesigned Agent Step Node
 * 
 * A modern node for displaying AI agent steps with proper design system integration.
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Bot, 
  User, 
  Code, 
  Terminal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ArchNodeData } from '../../types';
import { Button } from '../ui/button';
import { cn, truncate } from '../../lib/utils';

interface AgentStepNodeProps {
  id: string;
  data: ArchNodeData;
  selected?: boolean;
}

// Status icons
const STATUS_ICONS: Record<string, React.ElementType> = {
  running: Clock,
  done: CheckCircle2,
  error: XCircle,
  idle: AlertCircle,
  skipped: AlertCircle,
};

// Step type icons
const STEP_TYPE_ICONS: Record<string, React.ElementType> = {
  USER_INPUT: User,
  PLANNER_RESPONSE: Bot,
  TOOL_CALL: Code,
  TOOL_RESULT: Terminal,
  THOUGHT: Bot,
  DEFAULT: Bot,
};

// Status colors
const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  running: { dot: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
  done: { dot: '#10B981', bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981' },
  error: { dot: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' },
  idle: { dot: '#94A3B8', bg: 'rgba(148, 163, 184, 0.2)', text: '#94A3B8' },
  blocked: { dot: '#F97316', bg: 'rgba(249, 115, 22, 0.2)', text: '#F97316' },
  skipped: { dot: '#94A3B8', bg: 'rgba(148, 163, 184, 0.2)', text: '#94A3B8' },
};

export const AgentStepNode: React.FC<AgentStepNodeProps> = ({ id, data, selected }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Get icons based on data
  const stepType = data.type || 'DEFAULT';
  const StepIcon = STEP_TYPE_ICONS[stepType] || Bot;
  const StatusIcon = STATUS_ICONS[data.status || 'idle'] || AlertCircle;
  const statusInfo = STATUS_COLORS[data.status || 'idle'] || STATUS_COLORS.idle;

  // Determine label based on data
  const getLabel = () => {
    if (data.label) return data.label;
    if (data.toolUsed) return `Tool: ${data.toolUsed}`;
    if (stepType === 'USER_INPUT') return 'User Instruction';
    if (stepType === 'PLANNER_RESPONSE') return 'Agent Reasoning';
    if (stepType === 'TOOL_CALL') return 'Tool Call';
    return 'Agent Step';
  };

  // Toggle expansion
  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div
      className={cn(
        `group relative w-[270px] rounded-xl transition-all duration-150 select-none`,
        selected
          ? 'selected ring-2 ring-brand-primary border-brand-primary bg-surface-active' 
          : 'border border-border hover:border-border-strong bg-surface'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-zinc-400 !border-2 !border-background hover:!bg-brand-primary hover:!scale-125 transition-all"
      />

      <div className="p-3 space-y-2">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Step Icon */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-hover border border-border-subtle">
              <StepIcon className="w-4 h-4 text-brand-primary" />
            </div>
            
            {/* Label and Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold truncate">
                  {getLabel()}
                </h4>
                <span className="text-xs font-mono text-muted">
                  #{data.stepIndex || '1'}
                </span>
              </div>
              
              {/* Description Preview */}
              {data.description && !expanded && (
                <p className="text-[11px] text-muted truncate">
                  {truncate(data.description, 40)}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-mono"
              style={{ 
                backgroundColor: statusInfo.bg, 
                color: statusInfo.text 
              }}
            >
              {data.status || 'idle'}
            </span>
            
            {/* Expand Toggle */}
            <Button
              variant="ghost"
              size="icon"
              theme="dark"
              onClick={toggleExpanded}
              className="h-6 w-6 p-0"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            {/* Full Description */}
            {data.description && (
              <p className="text-[11px] text-muted">
                {data.description}
              </p>
            )}

            {/* Tool Information */}
            {data.toolUsed && (
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-[11px] font-mono text-muted">
                  {data.toolUsed}
                </span>
              </div>
            )}

            {/* Arguments Preview */}
            {data.argsPreview && (
              <div className="bg-surface-hover border border-border-subtle rounded p-2">
                <pre className="text-[10px] font-mono text-muted overflow-x-auto">
                  {truncate(data.argsPreview, 100)}
                </pre>
              </div>
            )}

            {/* Thought Process */}
            {data.thought && (
              <div className="bg-surface-hover border border-border-subtle rounded p-2">
                <p className="text-[10px] text-muted italic">
                  {truncate(data.thought, 150)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {data.timestamp && expanded && (
          <div className="pt-2 border-t border-border-subtle">
            <span className="text-[10px] font-mono text-muted">
              {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-zinc-400 !border-2 !border-background hover:!bg-brand-primary hover:!scale-125 transition-all"
      />
    </div>
  );
};

export default AgentStepNode;
