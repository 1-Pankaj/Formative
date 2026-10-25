import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { StickyNote } from '../ui/FormativeGlyphs';

interface NoteNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    tags?: string[];
  };
  selected?: boolean;
}

export const NoteNode: React.FC<NoteNodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`group relative w-72 rounded border p-3.5 transition-colors select-none shadow-sm ${
        selected
          ? 'border-[#E04418] ring-1 ring-[#E04418]'
          : 'border-[#3e3e42] hover:border-[#E04418]'
      } bg-[#252526] text-[#cccccc]`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#E04418] !border !border-[#1e1e1e] hover:!scale-150 transition-transform"
      />

      <div className="flex items-center gap-1.5 mb-2 text-[#858585]">
        <StickyNote className="w-3.5 h-3.5 text-[#E04418]" />
        <h5 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white">
          {data.label || 'Architecture Memo'}
        </h5>
      </div>

      <p className="text-xs text-[#cccccc] leading-relaxed font-sans">
        {data.description || 'Document architecture rules, deployment contracts, or team conventions...'}
      </p>

      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-[#3e3e42]">
          {data.tags.map((t, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e1e] text-[#858585] border border-[#3e3e42]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#E04418] !border !border-[#1e1e1e] hover:!scale-150 transition-transform"
      />
    </div>
  );
};
