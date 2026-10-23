import React from 'react';
import { 
  Globe, 
  Server, 
  Database, 
  Zap, 
  Network, 
  ArrowLeftRight, 
  Cpu, 
  Crown, 
  Shield, 
  FileText,
  Plus
} from 'lucide-react';
import { NodeCategory, ThemeMode } from '../types';

interface SidebarProps {
  theme: ThemeMode;
  onAddNode: (category: NodeCategory) => void;
  nodeCount: number;
  edgeCount: number;
}

const componentPalette: Array<{ 
  category: NodeCategory; 
  label: string; 
  tag: string; 
  icon: React.ElementType;
  color: string;
}> = [
  { category: 'frontend', label: 'Frontend Client', tag: 'UI', icon: Globe, color: 'text-blue-400' },
  { category: 'gateway', label: 'API Gateway', tag: 'GATEWAY', icon: Network, color: 'text-purple-400' },
  { category: 'backend', label: 'Backend Service', tag: 'SERVICE', icon: Server, color: 'text-emerald-400' },
  { category: 'database', label: 'Database Storage', tag: 'DATA', icon: Database, color: 'text-amber-400' },
  { category: 'cache', label: 'Cache & Memory', tag: 'CACHE', icon: Zap, color: 'text-cyan-400' },
  { category: 'queue', label: 'Message Queue / Event', tag: 'QUEUE', icon: ArrowLeftRight, color: 'text-pink-400' },
  { category: 'worker', label: 'Background Worker', tag: 'WORKER', icon: Cpu, color: 'text-indigo-400' },
  { category: 'ai-agent', label: 'AI Agent Coordinator', tag: 'AI', icon: Crown, color: 'text-amber-300' },
  { category: 'auth', label: 'Auth & Policy', tag: 'AUTH', icon: Shield, color: 'text-red-400' },
  { category: 'note', label: 'Architecture Memo', tag: 'DOC', icon: FileText, color: 'text-zinc-400' },
];

export const Sidebar: React.FC<SidebarProps> = ({ theme, onAddNode, nodeCount, edgeCount }) => {
  const isDark = theme !== 'light';

  return (
    <aside className={`w-40 xl:w-52 2xl:w-60 border-r flex flex-col justify-between p-2.5 xl:p-3 z-20 select-none overflow-y-auto shrink-0 ${
      isDark 
        ? 'bg-[#0e0e11] border-[#27272a] text-zinc-300' 
        : 'bg-[#fafafa] border-zinc-200 text-zinc-800'
    }`}>
      <div className="space-y-3">
        {/* Title */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Component Library
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            + Click to add
          </span>
        </div>

        {/* List of engineering components */}
        <div className="space-y-1">
          {componentPalette.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.category}
                onClick={() => onAddNode(t.category)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition-all ${
                  isDark
                    ? 'border-transparent hover:border-[#27272a] hover:bg-[#18181c] text-zinc-300 hover:text-white'
                    : 'border-transparent hover:border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                  <span className="text-xs font-medium truncate">
                    {t.label}
                  </span>
                </div>

                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  isDark ? 'bg-[#121215] border-[#27272a] text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
                }`}>
                  {t.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Stats & Minimal Hint */}
      <div className={`pt-3 border-t space-y-1 text-xs font-mono px-1 ${
        isDark ? 'border-[#27272a] text-zinc-500' : 'border-zinc-200 text-zinc-600'
      }`}>
        <div className="flex items-center justify-between text-[11px]">
          <span>Nodes: <strong className={isDark ? 'text-white' : 'text-black'}>{nodeCount}</strong></span>
          <span>Wires: <strong className={isDark ? 'text-white' : 'text-black'}>{edgeCount}</strong></span>
        </div>
        <p className="text-[10px] leading-relaxed pt-1 text-zinc-500">
          Right-click canvas for quick placement.
        </p>
      </div>
    </aside>
  );
};
