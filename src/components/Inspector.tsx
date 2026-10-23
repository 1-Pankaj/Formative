/**
 * Formative Studio - Redesigned Inspector Component
 * 
 * A modern property inspector with proper design system integration.
 */

import React from 'react';
import { X, Trash2, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { ArchNodeData, NodeCategory, StepStatus, ThemeMode } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { cn, capitalize } from '../lib/utils';

interface InspectorProps {
  theme?: ThemeMode;
  selectedNode: { id: string; data: ArchNodeData } | null;
  onClose: () => void;
  onUpdateNode: (id: string, updatedData: Partial<ArchNodeData>) => void;
  onDeleteNode: (id: string) => void;
}

const categories: Array<{ id: NodeCategory; label: string; description: string }> = [
  { id: 'frontend', label: 'Frontend Client UI', description: 'User interface and client-side components' },
  { id: 'gateway', label: 'API Gateway / Ingress', description: 'API routing, authentication, and request handling' },
  { id: 'backend', label: 'Backend Microservice', description: 'Core business logic and server-side processing' },
  { id: 'database', label: 'Database Storage', description: 'Persistent data storage and retrieval systems' },
  { id: 'cache', label: 'Cache / Memory Store', description: 'High-speed in-memory caching for performance' },
  { id: 'queue', label: 'Message Queue / Event Stream', description: 'Asynchronous message processing and event handling' },
  { id: 'worker', label: 'Background Worker / Cron', description: 'Background job processing and scheduled tasks' },
  { id: 'ai-agent', label: 'AI Model / Agent Pipeline', description: 'Autonomous AI agents and orchestration' },
  { id: 'auth', label: 'Auth & Policy Security', description: 'Authentication, authorization, and security policies' },
  { id: 'service', label: 'General Service', description: 'Standard domain services and APIs' },
  { id: 'note', label: 'Architecture Memo / ADR', description: 'Architecture documentation and design records' },
];

const statuses: Array<{ id: StepStatus; label: string; description: string }> = [
  { id: 'idle', label: 'Standby / Planned', description: 'Component is idle or planned' },
  { id: 'running', label: 'Active / Executing', description: 'Component is currently active or executing' },
  { id: 'done', label: 'Completed / Verified', description: 'Component has completed successfully' },
  { id: 'error', label: 'Fault / Error', description: 'Component encountered an error' },
  { id: 'skipped', label: 'Omitted / Deprecated', description: 'Component was skipped or deprecated' },
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
  const isDark = theme === 'dark';
  const [expandedSections, setExpandedSections] = React.useState({
    basic: true,
    details: true,
    metadata: true,
  });

  // Get category info
  const categoryInfo = categories.find(c => c.id === data.category) || categories[0];
  const statusInfo = statuses.find(s => s.id === data.status) || statuses[0];

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <aside
      className={cn(
        `w-80 border-l flex flex-col justify-between p-3 z-20 select-none overflow-y-auto shrink-0`,
        isDark 
          ? 'bg-dark-surface border-dark-border text-text-secondary' 
          : 'bg-light-surface border-light-border text-zinc-800'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          `flex items-center justify-between border-b pb-3`,
          isDark ? 'border-dark-border' : 'border-light-border'
        )}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-primary" />
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isDark ? 'text-text-muted' : 'text-zinc-500'
            )}
          >
            Inspector
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          theme={theme}
          onClick={onClose}
          className="p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-3">
        {/* Basic Section */}
        <Card variant="bordered" padding="none" theme={theme} className="mb-3">
          <CardHeader
            theme={theme}
            className="cursor-pointer"
            onClick={() => toggleSection('basic')}
          >
            <div className="flex items-center justify-between">
              <CardTitle theme={theme} className="text-sm">
                Basic Properties
              </CardTitle>
              {expandedSections.basic ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </div>
          </CardHeader>
          
          {expandedSections.basic && (
            <CardContent theme={theme} className="space-y-3 pt-2">
              {/* Component Label */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Component Label
                </label>
                <Input
                  theme={theme}
                  value={data.label || ''}
                  onChange={(e) => onUpdateNode(id, { label: e.target.value })}
                  className="text-sm"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={data.category || 'backend'}
                    onChange={(e) => onUpdateNode(id, { category: e.target.value as NodeCategory })}
                    className={cn(
                      `w-full px-2.5 py-1.5 rounded-lg border text-sm font-medium`,
                      `focus:outline-none focus:ring-2 focus:ring-brand-primary`,
                      isDark
                        ? 'bg-dark-surface border-dark-border text-text-primary hover:border-dark-border-strong'
                        : 'bg-white border-light-border text-zinc-900 hover:border-light-border-strong'
                    )}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Status
                </label>
                <div className="flex gap-1">
                  {statuses.map((status) => (
                    <Button
                      key={status.id}
                      variant={data.status === status.id ? 'primary' : 'outline'}
                      size="xs"
                      theme={theme}
                      onClick={() => onUpdateNode(id, { status: status.id })}
                      className="flex-1"
                    >
                      {status.id}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Details Section */}
        <Card variant="bordered" padding="none" theme={theme} className="mb-3">
          <CardHeader
            theme={theme}
            className="cursor-pointer"
            onClick={() => toggleSection('details')}
          >
            <div className="flex items-center justify-between">
              <CardTitle theme={theme} className="text-sm">
                Details
              </CardTitle>
              {expandedSections.details ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </div>
          </CardHeader>
          
          {expandedSections.details && (
            <CardContent theme={theme} className="space-y-3 pt-2">
              {/* Subtitle / Path */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Source Path / Module
                </label>
                <Input
                  theme={theme}
                  value={data.subtitle || ''}
                  onChange={(e) => onUpdateNode(id, { subtitle: e.target.value })}
                  className="text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Description
                </label>
                <textarea
                  value={data.description || ''}
                  onChange={(e) => onUpdateNode(id, { description: e.target.value })}
                  className={cn(
                    `w-full px-2.5 py-1.5 rounded-lg border text-sm resize-none`,
                    `focus:outline-none focus:ring-2 focus:ring-brand-primary`,
                    isDark
                      ? 'bg-dark-surface border-dark-border text-text-primary placeholder:text-muted min-h-[80px]'
                      : 'bg-white border-light-border text-zinc-900 placeholder:text-zinc-400 min-h-[80px]'
                  )}
                  placeholder="Enter component description..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {(data.tags || []).length > 0 ? (
                    (data.tags as string[]).map((tag, index) => (
                      <span
                        key={index}
                        className={cn(
                          'px-2 py-0.5 rounded border text-[10px] font-mono',
                          isDark 
                            ? 'bg-dark-surface-hover border-dark-border text-text-secondary' 
                            : 'bg-light-surface-hover border-light-border text-zinc-700'
                        )}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted italic">No tags</span>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Metadata Section */}
        <Card variant="bordered" padding="none" theme={theme}>
          <CardHeader
            theme={theme}
            className="cursor-pointer"
            onClick={() => toggleSection('metadata')}
          >
            <div className="flex items-center justify-between">
              <CardTitle theme={theme} className="text-sm">
                Metadata
              </CardTitle>
              {expandedSections.metadata ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </div>
          </CardHeader>
          
          {expandedSections.metadata && (
            <CardContent theme={theme} className="space-y-3 pt-2">
              {/* File Paths */}
              {(data.filePaths || []).length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                    File Paths
                  </label>
                  <div className="space-y-1">
                    {(data.filePaths as string[]).map((filePath, index) => (
                      <div
                        key={index}
                        className={cn(
                          'px-2 py-1 rounded border text-[10px] font-mono truncate',
                          isDark 
                            ? 'bg-dark-surface-hover border-dark-border text-text-secondary' 
                            : 'bg-light-surface-hover border-light-border text-zinc-700'
                        )}
                      >
                        {filePath}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tool Used */}
              {data.toolUsed && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
                    Tool Used
                  </label>
                  <div
                    className={cn(
                      'px-2 py-1 rounded border text-sm font-mono',
                      isDark 
                        ? 'bg-dark-surface-hover border-dark-border text-text-secondary' 
                        : 'bg-light-surface-hover border-light-border text-zinc-700'
                    )}
                  >
                    {data.toolUsed}
                  </div>
                </div>
              )}

              {/* Delete Button */}
              <div className="pt-2">
                <Button
                  variant="danger"
                  size="sm"
                  theme={theme}
                  onClick={() => onDeleteNode(id)}
                  className="w-full justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Component</span>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </aside>
  );
};

export default Inspector;
