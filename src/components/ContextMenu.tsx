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
} from 'lucide-react';
import { NodeCategory } from '../types';

interface ContextMenuProps {
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 280) }}
      className="fixed z-50 w-52 rounded bg-[#252526] border border-[#3e3e42] shadow-xl py-1 text-xs text-[#cccccc] font-sans select-none"
    >
      {nodeId ? (
        // Context Menu for a Node
        <>
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#858585] border-b border-[#3e3e42]">
            Node Actions
          </div>
          <button
            onClick={() => {
              if (onDuplicateNode) onDuplicateNode(nodeId);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#858585]" />
            <span>Duplicate Component</span>
          </button>
          <button
            onClick={() => {
              if (onDisconnectNode) onDisconnectNode(nodeId);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <Unlink className="w-3.5 h-3.5 text-[#858585]" />
            <span>Disconnect Wires</span>
          </button>
          <div className="my-1 border-t border-[#3e3e42]" />
          <button
            onClick={() => {
              if (onDeleteNode) onDeleteNode(nodeId);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-rose-500/20 text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Component</span>
          </button>
        </>
      ) : (
        // Context Menu for Empty Canvas
        <>
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#858585] border-b border-[#3e3e42]">
            Add Architecture Component
          </div>
          <button
            onClick={() => {
              onAddNode('frontend', x, y);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <Layout className="w-3.5 h-3.5 text-[#858585]" />
            <span>Frontend Client UI</span>
          </button>
          <button
            onClick={() => {
              onAddNode('gateway', x, y);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <Network className="w-3.5 h-3.5 text-[#858585]" />
            <span>API Gateway / Router</span>
          </button>
          <button
            onClick={() => {
              onAddNode('backend', x, y);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-[#858585]" />
            <span>Backend Microservice</span>
          </button>
          <button
            onClick={() => {
              onAddNode('database', x, y);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#858585]" />
            <span>Database Storage</span>
          </button>
          <button
            onClick={() => {
              onAddNode('queue', x, y);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#858585]" />
            <span>Message Queue / Event</span>
          </button>
          <button
            onClick={() => {
              onAddNode('note', x, y);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#858585]" />
            <span>Architecture Memo</span>
          </button>

          <div className="my-1 border-t border-[#3e3e42]" />

          <button
            onClick={() => {
              onAutoLayout();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#E04418]" />
            <span>Tidy Layout</span>
          </button>
          <button
            onClick={() => {
              onFitView();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#2d2d2d] text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#858585]" />
            <span>Fit Canvas to View</span>
          </button>
        </>
      )}
    </div>
  );
};
