/**
 * Formative Studio - Redesigned Note Node
 * 
 * A modern note node component with proper design system integration.
 */

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ArchNodeData } from '../../types';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface NoteNodeProps {
  id: string;
  data: ArchNodeData;
  selected?: boolean;
}

export const NoteNode: React.FC<NoteNodeProps> = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [content, setContent] = React.useState(data.description || '');
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [content, isEditing]);

  // Save content
  const handleSave = () => {
    // In a real implementation, this would call onUpdateNode
    // For now, we'll just toggle editing
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setContent(data.description || '');
    setIsEditing(false);
  };

  // Start editing
  const handleStartEditing = () => {
    setIsEditing(true);
    setContent(data.description || '');
  };

  return (
    <div
      className={cn(
        `group relative w-[270px] rounded-xl transition-all duration-150 select-none`,
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
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15 border border-amber-500/30">
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-sm font-semibold truncate">
              {data.label || 'Note'}
            </h4>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  theme="dark"
                  onClick={handleSave}
                  className="h-5 w-5 p-0"
                >
                  <Edit2 className="w-3 h-3 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  theme="dark"
                  onClick={handleCancel}
                  className="h-5 w-5 p-0"
                >
                  <X className="w-3 h-3 text-red-500" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                theme="dark"
                onClick={handleStartEditing}
                className="h-5 w-5 p-0"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[80px]">
          {isEditing ? (
            <textarea
              ref={textAreaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(
                `w-full px-2 py-1.5 rounded border text-sm resize-none`,
                `focus:outline-none focus:ring-2 focus:ring-brand-primary`,
                'bg-surface border-border text-text-primary placeholder:text-muted min-h-[80px]'
              )}
              placeholder="Enter note content..."
              autoFocus
            />
          ) : (
            <div
              className={cn(
                'text-sm text-text-secondary prose prose-invert max-w-none',
                'prose-p:margin-0 prose-strong:text-text-primary prose-code:text-brand-primary'
              )}
            >
              {data.description || (
                <span className="text-muted italic">
                  Double-click to edit or add content...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {(data.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-border-subtle">
            {(data.tags as string[]).map((tag, index) => (
              <span
                key={index}
                className={cn(
                  'px-1.5 py-0.2 rounded border text-[10px] font-mono',
                  'bg-zinc-800 border-zinc-700 text-zinc-400'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
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

export default NoteNode;
