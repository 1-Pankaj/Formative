import React from 'react';
import { NodeCategory, ThemeMode } from '../types';

interface SidebarProps {
  theme: ThemeMode;
  onAddNode: (category: NodeCategory) => void;
  nodeCount: number;
  edgeCount: number;
}

const componentGroups: Array<{
  label: string;
  items: Array<{ category: NodeCategory; label: string }>;
}> = [
  {
    label: 'Application',
    items: [
      { category: 'frontend', label: 'Frontend client' },
      { category: 'gateway', label: 'API gateway' },
      { category: 'backend', label: 'Backend service' },
    ],
  },
  {
    label: 'Data',
    items: [
      { category: 'database', label: 'Database' },
      { category: 'cache', label: 'Cache' },
      { category: 'queue', label: 'Message queue' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { category: 'worker', label: 'Background worker' },
      { category: 'ai-agent', label: 'AI agent' },
      { category: 'auth', label: 'Authentication & policy' },
    ],
  },
  {
    label: 'Reference',
    items: [{ category: 'note', label: 'Architecture note' }],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ theme, onAddNode, nodeCount, edgeCount }) => {
  const isDark = theme !== 'light';

  return (
    <aside
      aria-label="Canvas building blocks"
      className={`z-20 flex w-56 shrink-0 select-none flex-col justify-between overflow-y-auto border-r px-4 py-4 xl:w-60 2xl:w-64 ${
        isDark ? 'border-[#27272a] bg-[#0e0e11] text-zinc-200' : 'border-zinc-200 bg-[#fafafa] text-zinc-900'
      }`}
    >
      <div>
        <div className="mb-5 px-1">
          <h2 className="text-sm font-semibold">Building blocks</h2>
          <p className={`mt-1 text-[13px] leading-5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Add a component, then connect it on the canvas.
          </p>
        </div>

        <div className="space-y-5">
          {componentGroups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h3 className={`mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {group.label}
              </h3>
              <div className={`divide-y ${isDark ? 'divide-[#222226]' : 'divide-zinc-200'}`}>
                {group.items.map((item) => (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => onAddNode(item.category)}
                    aria-label={`Add ${item.label} to canvas`}
                    className={`group flex min-h-10 w-full min-w-0 items-center justify-between gap-3 px-1 text-left text-[13px] font-medium leading-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e85b25] ${
                      isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-800 hover:text-black'
                    }`}
                  >
                    <span className="min-w-0 flex-1 whitespace-normal">{item.label}</span>
                    <span className={`shrink-0 text-[11px] font-normal opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Add
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className={`mt-5 border-t px-1 pt-3 text-[13px] ${isDark ? 'border-[#27272a] text-zinc-400' : 'border-zinc-200 text-zinc-600'}`}>
        <p className="font-medium tabular-nums">
          {nodeCount} {nodeCount === 1 ? 'component' : 'components'}
          <span className="mx-1.5 opacity-60">·</span>
          {edgeCount} {edgeCount === 1 ? 'connection' : 'connections'}
        </p>
        <p className="mt-1.5 text-xs leading-5">Right-click the canvas for quick placement.</p>
      </footer>
    </aside>
  );
};
