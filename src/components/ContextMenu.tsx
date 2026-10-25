import React, { useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  LayoutGrid, 
  Unlink, 
  Layers, 
  FileText, 
  Layout, 
  Server, 
  Database, 
  Maximize2,
  Network,
  ArrowLeftRight
} from './ui/FormativeGlyphs';
import { NodeCategory, ThemeMode } from '../types';

interface ContextMenuProps {
  theme?: ThemeMode;
  x: number;
  y: number;
  nodeId?: string;
  onClose: () => void;
  onAddNode: (category: NodeCategory, x: number, y: number) => void;
  onDuplicateNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDisconnectNode?: (nodeId: string) => void;
  onAutoLayout: () => void;
  onFitView: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  theme = 'dark',
  x,
  y,
  nodeId,
  onClose,
  onAddNode,
  onDuplicateNode,
  onDeleteNode,
  onDisconnectNode,
  onAutoLayout,
  onFitView,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = theme !== 'light';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const itemClass = `w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
    isDark ? 'hover:bg-zinc-800 text-zinc-200 hover:text-white' : 'hover:bg-zinc-100 text-zinc-700 hover:text-black'
  }`;
  const headerClass = `px-3 py-1 text-[10px] font-mono uppercase tracking-wider border-b ${
    isDark ? 'text-zinc-400 border-[#27272a]' : 'text-zinc-500 border-zinc-200'
  }`;
  const dividerClass = `my-1 border-t ${isDark ? 'border-[#27272a]' : 'border-zinc-200'}`;
  const iconMuted = isDark ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div
      ref={menuRef}
      style={{ left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 280) }}
      className={`fixed z-50 w-52 rounded-xl shadow-xl py-1 text-xs font-sans select-none border ${
        isDark ? 'bg-[#18181c] border-[#27272a] text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-lg'
      }`}
    >
      {nodeId ? (
        // Context Menu for a Node
        <>
          <div className={headerClass}>
            Node Actions
          </div>
          <button
            onClick={() => {
              if (onDuplicateNode) onDuplicateNode(nodeId);
              onClose();
            }}
            className={itemClass}
          >
            <Copy className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Duplicate Component</span>
          </button>
          <button
            onClick={() => {
              if (onDisconnectNode) onDisconnectNode(nodeId);
              onClose();
            }}
            className={itemClass}
          >
            <Unlink className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Disconnect Wires</span>
          </button>
          <div className={dividerClass} />
          <button
            onClick={() => {
              if (onDeleteNode) onDeleteNode(nodeId);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
              isDark ? 'hover:bg-rose-500/20 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Component</span>
          </button>
        </>
      ) : (
        // Context Menu for Empty Canvas
        <>
          <div className={headerClass}>
            Add Architecture Component
          </div>
          <button
            onClick={() => {
              onAddNode('frontend', x, y);
              onClose();
            }}
            className={itemClass}
          >
            <Layout className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Frontend Client UI</span>
          </button>
          <button
            onClick={() => {
              onAddNode('gateway', x, y);
              onClose();
            }}
            className={itemClass}
          >
            <Network className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>API Gateway / Router</span>
          </button>
          <button
            onClick={() => {
              onAddNode('backend', x, y);
              onClose();
            }}
            className={itemClass}
          >
            <Server className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Backend Microservice</span>
          </button>
          <button
            onClick={() => {
              onAddNode('database', x, y);
              onClose();
            }}
            className={itemClass}
          >
            <Database className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Database Storage</span>
          </button>
          <button
            onClick={() => {
              onAddNode('queue', x, y);
              onClose();
            }}
            className={itemClass}
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Message Queue / Event</span>
          </button>
          <button
            onClick={() => {
              onAddNode('note', x, y);
              onClose();
            }}
            className={itemClass}
          >
            <FileText className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Architecture Memo</span>
          </button>

          <div className={dividerClass} />

          <button
            onClick={() => {
              onAutoLayout();
              onClose();
            }}
            className={itemClass}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#E04418]" />
            <span>Tidy Layout</span>
          </button>
          <button
            onClick={() => {
              onFitView();
              onClose();
            }}
            className={itemClass}
          >
            <Maximize2 className={`w-3.5 h-3.5 ${iconMuted}`} />
            <span>Fit Canvas to View</span>
          </button>
        </>
      )}
    </div>
  );
};
