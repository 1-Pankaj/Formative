import React from 'react';
import { X, Trash2, Layers } from 'lucide-react';
import { ArchNodeData, NodeCategory, StepStatus, ThemeMode } from '../types';

interface InspectorProps {
  theme?: ThemeMode;
  selectedNode: { id: string; data: ArchNodeData } | null;
  onClose: () => void;
  onUpdateNode: (id: string, updatedData: Partial<ArchNodeData>) => void;
  onDeleteNode: (id: string) => void;
}

const categories: Array<{ id: NodeCategory; label: string }> = [
  { id: 'frontend', label: 'Frontend Client UI' },
  { id: 'gateway', label: 'API Gateway / Ingress' },
  { id: 'backend', label: 'Backend Microservice' },
  { id: 'database', label: 'Database Storage' },
  { id: 'cache', label: 'Cache / Memory Store' },
  { id: 'queue', label: 'Message Queue / Event Stream' },
  { id: 'worker', label: 'Background Worker / Cron' },
  { id: 'ai-agent', label: 'AI Model / Agent Pipeline' },
  { id: 'auth', label: 'Auth & Policy Security' },
  { id: 'service', label: 'General Service' },
  { id: 'note', label: 'Architecture Memo / ADR' },
  { id: 'folder', label: 'Project Folder' },
];

const statuses: Array<{ id: StepStatus; label: string }> = [
  { id: 'idle', label: 'Standby / Planned' },
  { id: 'running', label: 'Active / Executing' },
  { id: 'done', label: 'Completed / Verified' },
  { id: 'error', label: 'Fault / Error' },
  { id: 'skipped', label: 'Omitted / Deprecated' },
];

export const Inspector: React.FC<InspectorProps> = ({
  theme = 'dark',
  selectedNode,
  onClose,
  onUpdateNode,
  onDeleteNode,
}) => {
  if (!selectedNode) return null;

  const { id, data } = selectedNode;
  const isDark = theme !== 'light';

  return (
    <aside className={`w-72 2xl:w-80 border-l flex flex-col justify-between p-3 xl:p-3.5 z-20 select-none overflow-y-auto shrink-0 ${
      isDark 
        ? 'bg-[#0e0e11] border-[#27272a] text-zinc-300' 
        : 'bg-[#fafafa] border-zinc-200 text-zinc-800'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-2.5 ${
          isDark ? 'border-[#27272a]' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Inspector
            </span>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Component Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Component Label
          </label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => onUpdateNode(id, { label: e.target.value })}
            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#18181c] border-[#27272a] text-white focus:border-zinc-500'
                : 'bg-white border-zinc-200 text-black focus:border-zinc-400'
            }`}
          />
        </div>

        {/* Subtitle / Path */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Source Path / Module
          </label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => onUpdateNode(id, { subtitle: e.target.value })}
            placeholder="e.g. src/auth/service.ts"
            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#18181c] border-[#27272a] text-zinc-300 focus:border-zinc-500 placeholder-zinc-600'
                : 'bg-white border-zinc-200 text-zinc-800 focus:border-zinc-400 placeholder-zinc-400'
            }`}
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Architecture Role
          </label>
          <select
            value={data.category}
            onChange={(e) => onUpdateNode(id, { category: e.target.value as NodeCategory })}
            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none transition-colors ${
              isDark
                ? 'bg-[#18181c] border-[#27272a] text-white focus:border-zinc-500'
                : 'bg-white border-zinc-200 text-black focus:border-zinc-400'
            }`}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Folder maps have no execution state. */}
        {data.category !== 'folder' && (
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Execution / Life Cycle
            </label>
            <select
              value={data.status || 'idle'}
              onChange={(e) => onUpdateNode(id, { status: e.target.value as StepStatus })}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#18181c] border-[#27272a] text-white focus:border-zinc-500'
                  : 'bg-white border-zinc-200 text-black focus:border-zinc-400'
              }`}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Architecture Specification
          </label>
          <textarea
            rows={4}
            value={data.description || ''}
            onChange={(e) => onUpdateNode(id, { description: e.target.value })}
            placeholder="Describe interface contracts, data models, or SLAs..."
            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs leading-relaxed focus:outline-none resize-none transition-colors ${
              isDark
                ? 'bg-[#18181c] border-[#27272a] text-zinc-300 focus:border-zinc-500 placeholder-zinc-600'
                : 'bg-white border-zinc-200 text-zinc-800 focus:border-zinc-400 placeholder-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* Delete Component Button */}
      <div className={`pt-3 border-t ${isDark ? 'border-[#27272a]' : 'border-zinc-200'}`}>
        <button
          onClick={() => onDeleteNode(id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Component</span>
        </button>
      </div>
    </aside>
  );
};
