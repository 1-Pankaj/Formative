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
  Workflow,
  Code, 
  Shield, 
  FileText,
  Folder,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from '../ui/FormativeGlyphs';
import { ArchNodeData, NodeCategory } from '../../types';

interface ArchitectureCardNodeProps {
  id: string;
  data: ArchNodeData;
  selected?: boolean;
}

const CATEGORY_CONFIG: Record<NodeCategory, {
  icon: React.ElementType;
  roleDescription: string;
}> = {
  frontend: {
    icon: Globe,
    roleDescription: 'The part people see and use. It runs in a browser or mobile app and sends requests to the system.'
  },
  gateway: {
    icon: Network,
    roleDescription: 'A front door for API traffic. It checks incoming requests and sends them to the right service.'
  },
  backend: {
    icon: Server,
    roleDescription: 'Where the app’s rules run, such as creating an order, saving a change, or processing a request.'
  },
  database: {
    icon: Database,
    roleDescription: 'Stores records so the app can find and update them later.'
  },
  cache: {
    icon: Zap,
    roleDescription: 'Keeps frequently used information ready for quick access, such as sessions or recent results.'
  },
  queue: {
    icon: ArrowLeftRight,
    roleDescription: 'Holds work that should happen later, so one part of the system does not have to wait.'
  },
  worker: {
    icon: Cpu,
    roleDescription: 'Runs background jobs such as sending email, processing files, or handling scheduled work.'
  },
  'ai-agent': {
    icon: Workflow,
    roleDescription: 'A software agent that can plan work, use its available tools, and report results.'
  },
  auth: {
    icon: Shield,
    roleDescription: 'Checks who can access the system and which actions they are allowed to take.'
  },
  service: {
    icon: Server,
    roleDescription: 'A focused service that handles one part of the system and makes it available to other parts.'
  },
  note: {
    icon: FileText,
    roleDescription: 'A note that records decisions, assumptions, or details about this design.'
  },
  folder: {
    icon: Folder,
    roleDescription: 'A folder found in the project. Its files and connections have not been analyzed.'
  }
};

export const ArchitectureCardNode: React.FC<ArchitectureCardNodeProps> = ({ id, data, selected }) => {
  const [showHelp, setShowHelp] = useState(false);
  const cfg = CATEGORY_CONFIG[data.category] || CATEGORY_CONFIG.backend;
  const Icon = cfg.icon;

  const statusDot = data.status === 'running' 
    ? '#eab308' 
    : data.status === 'done' 
    ? '#10b981' 
    : data.status === 'error' 
    ? '#ef4444' 
    : '#71717a';

  return (
    <div
      className={`architecture-card-node group relative w-[270px] rounded-xl transition-all duration-150 select-none shadow-md ${
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
          {/* Node category with a visible status indicator */}
          <div className="relative shrink-0">
            <div className="node-category-icon w-9 h-9 rounded-full flex items-center justify-center border">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            {/* Live status dot */}
            {data.category !== 'folder' && (
              <span
                className="node-status-border absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#121215]"
                style={{ backgroundColor: statusDot }}
                title={`Status: ${data.status || 'idle'}`}
              />
            )}
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
                className="text-zinc-500 transition-colors p-0.5"
                title="What does this component do?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="node-subtitle text-[13px] text-[#a1a1aa] mt-0.5 leading-tight truncate">
              {data.subtitle || data.category}
            </p>

            {/* Model / Adapter Badge */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="node-category-tag text-[11px] font-mono px-1.5 py-0.5 rounded border uppercase font-medium">
                {data.category === 'folder' ? 'Folder' : data.category}
              </span>
              {data.tags && data.tags.slice(0, 2).map((t: string) => (
                <span
                  key={t}
                  className="node-tag text-[11px] font-mono text-[#a1a1aa] bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Beginner Explainer Drawer */}
        {showHelp && (
            <div className="node-guide-box p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[13px] text-zinc-300 space-y-1.5 animate-in fade-in duration-150">
            <div className="node-guide-title font-semibold flex items-center gap-1 text-[13px]">
              <span>{data.category === 'folder' ? 'Folder map' : 'About this component'}</span>
            </div>
            <p className="node-guide-copy text-[13px] leading-relaxed">
              {cfg.roleDescription}
            </p>
            {data.description && (
              <p className="node-guide-detail text-[13px] border-t border-zinc-800/80 pt-1 leading-relaxed">
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
