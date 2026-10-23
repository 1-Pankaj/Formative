import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Globe, 
  Network, 
  Server, 
  Database, 
  Zap, 
  ArrowLeftRight, 
  Cpu, 
  Bot, 
  Crown, 
  Code, 
  Shield, 
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ArchNodeData, NodeCategory } from '../../types';

interface PaperclipCardNodeProps {
  id: string;
  data: ArchNodeData;
  selected?: boolean;
}

const CATEGORY_CONFIG: Record<NodeCategory, {
  icon: React.ElementType;
  bgTint: string;
  dotColor: string;
  tagColor: string;
  roleDescription: string;
}> = {
  frontend: {
    icon: Globe,
    bgTint: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotColor: '#3b82f6',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    roleDescription: 'User Interface / Client Application that runs in browsers or mobile devices, dispatching API requests.'
  },
  gateway: {
    icon: Network,
    bgTint: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dotColor: '#a855f7',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    roleDescription: 'API Gateway & Ingress Router that validates auth tokens, handles CORS, and distributes traffic to microservices.'
  },
  backend: {
    icon: Server,
    bgTint: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotColor: '#10b981',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    roleDescription: 'Core business logic and microservice executing application rules, transactions, and data processing.'
  },
  database: {
    icon: Database,
    bgTint: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotColor: '#f59e0b',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    roleDescription: 'Persistent relational or document data store for user records, schemas, and historical state.'
  },
  cache: {
    icon: Zap,
    bgTint: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dotColor: '#06b6d4',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    roleDescription: 'High-speed in-memory store for active session tokens, rate limits, and cached query results.'
  },
  queue: {
    icon: ArrowLeftRight,
    bgTint: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    dotColor: '#ec4899',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    roleDescription: 'Asynchronous event bus or message queue ensuring decoupling and reliable delivery of background tasks.'
  },
  worker: {
    icon: Cpu,
    bgTint: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    dotColor: '#6366f1',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    roleDescription: 'Background worker or cron process consuming queue messages, sending emails, or processing media.'
  },
  'ai-agent': {
    icon: Crown,
    bgTint: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotColor: '#eab308',
    tagColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    roleDescription: 'Autonomous AI agent (Claude Code, Antigravity, OpenCode, Codex) executing prompts and tool runs.'
  },
  auth: {
    icon: Shield,
    bgTint: 'bg-red-500/15 text-red-400 border-red-500/30',
    dotColor: '#ef4444',
    tagColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    roleDescription: 'Identity and access management validating cryptographic credentials, OAuth 2.0, and roles.'
  },
  service: {
    icon: Server,
    bgTint: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotColor: '#10b981',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    roleDescription: 'Standard domain service providing specialized business APIs.'
  },
  note: {
    icon: FileText,
    bgTint: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    dotColor: '#71717a',
    tagColor: 'text-zinc-400 bg-zinc-800 border-zinc-700',
    roleDescription: 'Architecture documentation memo and contracts.'
  }
};

export const PaperclipCardNode: React.FC<PaperclipCardNodeProps> = ({ id, data, selected }) => {
  const [showHelp, setShowHelp] = useState(false);
  const cfg = CATEGORY_CONFIG[data.category] || CATEGORY_CONFIG.backend;
  const Icon = cfg.icon;

  const statusDot = data.status === 'running' 
    ? '#eab308' 
    : data.status === 'done' 
    ? '#10b981' 
    : data.status === 'error' 
    ? '#ef4444' 
    : cfg.dotColor;

  return (
    <div
      className={`paperclip-node-card group relative w-[270px] rounded-xl transition-all duration-150 select-none shadow-md ${
        selected
          ? 'selected ring-2 ring-white border-white bg-[#18181c]'
          : 'border border-[#27272a] hover:border-[#3f3f46] bg-[#121215]'
      }`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-zinc-400 !border-2 !border-[#09090b] hover:!bg-white hover:!scale-125 transition-all"
      />

      <div className="p-3.5 space-y-2.5">
        {/* Top Row: Avatar + Title & Role */}
        <div className="flex items-start gap-3">
          {/* Avatar Icon with Status Dot (Paperclip signature) */}
          <div className="relative shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${cfg.bgTint}`}>
              <Icon className="w-4 h-4" />
            </div>
            {/* Live status dot */}
            <span
              className="node-status-border absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121215]"
              style={{ backgroundColor: statusDot }}
              title={`Status: ${data.status || 'idle'}`}
            />
          </div>

          {/* Name & Subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="node-title text-sm font-semibold text-[#fafafa] leading-tight truncate">
                {data.label}
              </h4>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHelp(!showHelp);
                }}
                className="text-zinc-500 hover:text-white transition-colors p-0.5"
                title="What does this component do?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="node-subtitle text-xs text-[#a1a1aa] mt-0.5 leading-tight truncate">
              {data.subtitle || data.category}
            </p>

            {/* Model / Adapter Badge */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-medium ${cfg.tagColor}`}>
                {data.category}
              </span>
              {data.tags && data.tags.slice(0, 2).map((t: string) => (
                <span
                  key={t}
                  className="node-tag text-[10px] font-mono text-[#a1a1aa] bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Beginner Explainer Drawer */}
        {showHelp && (
          <div className="node-guide-box p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 space-y-1.5 animate-in fade-in duration-150">
            <div className="font-semibold text-white flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-400">
              <span>Architect's Guide</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              {cfg.roleDescription}
            </p>
            {data.description && (
              <p className="text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-1 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-zinc-400 !border-2 !border-[#09090b] hover:!bg-white hover:!scale-125 transition-all"
      />
    </div>
  );
};
