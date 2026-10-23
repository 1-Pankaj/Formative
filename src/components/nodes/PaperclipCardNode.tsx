/**
 * Formative Studio - Redesigned Paperclip Card Node
 * 
 * A modern, clean node card component with proper design system integration.
 */

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
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { ArchNodeData, NodeCategory } from '../../types';
import { Button } from '../ui/button';
import { cn, truncate } from '../../lib/utils';

interface PaperclipCardNodeProps {
  id: string;
  data: ArchNodeData;
  selected?: boolean;
}

// Category configuration with design system colors
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

// Status colors
const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  running: { dot: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' },
  done: { dot: '#10B981', bg: 'rgba(16, 185, 129, 0.2)', text: '#10B981' },
  error: { dot: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' },
  idle: { dot: '#94A3B8', bg: 'rgba(148, 163, 184, 0.2)', text: '#94A3B8' },
  blocked: { dot: '#F97316', bg: 'rgba(249, 115, 22, 0.2)', text: '#F97316' },
};

export const PaperclipCardNode: React.FC<PaperclipCardNodeProps> = ({ id, data, selected }) => {
  const [showHelp, setShowHelp] = useState(false);
  const cfg = CATEGORY_CONFIG[data.category] || CATEGORY_CONFIG.backend;
  const Icon = cfg.icon;
  
  // Get status colors
  const statusInfo = STATUS_COLORS[data.status || 'idle'] || STATUS_COLORS.idle;

  return (
    <div
      className={cn(
        `paperclip-node-card group relative w-[270px] rounded-xl transition-all duration-150 select-none`,
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
        {/* Top Row: Avatar + Title & Status */}
        <div className="flex items-start gap-3">
          {/* Avatar Icon with Status Dot */}
          <div className="relative shrink-0">
            <div className={cn(`w-9 h-9 rounded-full flex items-center justify-center border ${cfg.bgTint}`)}>
              <Icon className="w-4 h-4" />
            </div>
            {/* Live status dot */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface"
              style={{ backgroundColor: statusInfo.dot }}
            />
          </div>

          {/* Title and Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="space-y-0.5">
              <h4 className="node-title text-sm font-semibold truncate">
                {data.label || 'Untitled'}
              </h4>
              {data.subtitle && (
                <p className="node-subtitle text-[11px] truncate">
                  {truncate(data.subtitle, 40)}
                </p>
              )}
            </div>
            
            {/* AI Live Badge */}
            {data.isAiLive && (
              <span className="absolute top-0 right-0 text-[10px] font-mono bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg border border-brand-primary/20">
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {data.description && !showHelp && (
          <p className="text-[11px] text-muted line-clamp-2">
            {truncate(data.description, 80)}
          </p>
        )}

        {/* Help/Role Description Toggle */}
        {showHelp ? (
          <div className="text-[11px] text-muted node-guide-box p-2 rounded-md bg-surface-hover border border-border-subtle">
            {cfg.roleDescription}
          </div>
        ) : (
          (data.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(data.tags as string[]).slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className={cn(
                    'node-tag px-1.5 py-0.2 rounded border text-[10px] font-mono',
                    cfg.tagColor
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )
        )}

        {/* Bottom Row: Status + Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Step Index */}
            {data.stepIndex && (
              <span className="text-[10px] font-mono text-muted">
                #{data.stepIndex}
              </span>
            )}
            
            {/* Model Adapter */}
            {data.modelAdapter && (
              <span className="text-[10px] font-mono text-muted">
                {data.modelAdapter}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Help Toggle */}
            <Button
              variant="ghost"
              size="icon"
              theme="dark"
              onClick={() => setShowHelp(!showHelp)}
              className="h-6 w-6 p-0"
            >
              {showHelp ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <HelpCircle className="w-3.5 h-3.5" />
              )}
            </Button>

            {/* External Link for AI Steps */}
            {data.modelAdapter && (
              <Button
                variant="ghost"
                size="icon"
                theme="dark"
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
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

export default PaperclipCardNode;
