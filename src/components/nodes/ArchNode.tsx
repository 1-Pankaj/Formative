import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Layout, 
  Server, 
  Database, 
  Zap, 
  Network, 
  ArrowLeftRight, 
  Cpu, 
  BrainCircuit, 
  Shield, 
  FileText,
  Folder,
  Boxes
} from 'lucide-react';
import { ArchNodeData, NodeCategory, StepStatus } from '../../types';

interface ArchNodeProps {
  id: string;
  data: ArchNodeData;
  selected?: boolean;
}

const categoryIcons: Record<NodeCategory, React.ElementType> = {
  'frontend': Layout,
  'gateway': Network,
  'backend': Server,
  'database': Database,
  'cache': Zap,
  'queue': ArrowLeftRight,
  'worker': Cpu,
  'ai-agent': BrainCircuit,
  'auth': Shield,
  'service': Server,
  'note': FileText,
  'folder': Folder,
};

const categoryLabels: Record<NodeCategory, string> = {
  'frontend': 'UI LAYER',
  'gateway': 'API GATEWAY',
  'backend': 'SERVICE',
  'database': 'DATA STORE',
  'cache': 'CACHE / MEMORY',
  'queue': 'EVENT QUEUE',
  'worker': 'WORKER JOB',
  'ai-agent': 'AI PIPELINE',
  'auth': 'AUTH & POLICY',
  'service': 'SERVICE COMPONENT',
  'note': 'NOTE',
  'folder': 'PROJECT FOLDER',
};

const statusStyles: Record<StepStatus, { label: string; dot: string; text: string }> = {
  'idle': { label: 'Standby', dot: 'bg-zinc-400', text: 'text-zinc-400' },
  'running': { label: 'Active', dot: 'bg-amber-500', text: 'text-amber-500' },
  'done': { label: 'Verified', dot: 'bg-emerald-500', text: 'text-emerald-500' },
  'error': { label: 'Fault', dot: 'bg-rose-500', text: 'text-rose-500' },
  'skipped': { label: 'Skipped', dot: 'bg-zinc-500', text: 'text-zinc-500' },
};

export const ArchNode: React.FC<ArchNodeProps> = ({ data, selected }) => {
  const Icon = categoryIcons[data.category] || Boxes;
  const tag = categoryLabels[data.category] || 'COMPONENT';
  const status = statusStyles[data.status || 'idle'];

  return (
    <div
      className={`group relative w-84 rounded border transition-all select-none shadow-sm ${
        selected
          ? 'border-[#E04418] ring-1 ring-[#E04418]'
          : data.status === 'running'
          ? 'border-amber-500/80'
          : 'border-[#3e3e42] hover:border-[#E04418]'
      } bg-[#252526] text-[#cccccc]`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#E04418] !border !border-[#1e1e1e] hover:!scale-150 transition-transform"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#3e3e42] bg-[#1e1e1e] rounded-t">
        <div className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-wider text-[#858585] uppercase">
          <Icon className="w-3.5 h-3.5 text-[#E04418]" />
          <span>{tag}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className={status.text}>{status.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2">
        <div>
          <h3 className="text-xs font-semibold text-white tracking-tight leading-snug">
            {data.label}
          </h3>
          {data.subtitle && (
            <p className="text-[11px] font-mono text-[#858585] mt-0.5 truncate">
              {data.subtitle}
            </p>
          )}
        </div>

        {data.description && (
          <p className="text-xs text-[#cccccc] leading-relaxed line-clamp-3">
            {data.description}
          </p>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.tags.map((tagItem: string, idx: number) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1e1e1e] text-[#858585] border border-[#3e3e42]"
              >
                {tagItem}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#E04418] !border !border-[#1e1e1e] hover:!scale-150 transition-transform"
      />
    </div>
  );
};
