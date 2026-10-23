/**
 * Formative Studio - Redesigned Sidebar Component
 * 
 * A modern component library sidebar with proper design system integration.
 */

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
  Plus,
  Search
} from 'lucide-react';
import { NodeCategory, ThemeMode } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

interface SidebarProps {
  theme: ThemeMode;
  onAddNode: (category: NodeCategory) => void;
  nodeCount: number;
  edgeCount: number;
}

// Component palette with proper design system integration
const componentPalette: Array<{ 
  category: NodeCategory; 
  label: string; 
  tag: string; 
  icon: React.ElementType;
  color: string;
  description: string;
}> = [
  { 
    category: 'frontend', 
    label: 'Frontend Client', 
    tag: 'UI', 
    icon: Globe, 
    color: 'text-blue-400',
    description: 'User interface components and client applications'
  },
  { 
    category: 'gateway', 
    label: 'API Gateway', 
    tag: 'GATEWAY', 
    icon: Network, 
    color: 'text-purple-400',
    description: 'API routing, authentication, and request handling'
  },
  { 
    category: 'backend', 
    label: 'Backend Service', 
    tag: 'SERVICE', 
    icon: Server, 
    color: 'text-emerald-400',
    description: 'Core business logic and microservices'
  },
  { 
    category: 'database', 
    label: 'Database Storage', 
    tag: 'DATA', 
    icon: Database, 
    color: 'text-amber-400',
    description: 'Persistent data storage and retrieval'
  },
  { 
    category: 'cache', 
    label: 'Cache & Memory', 
    tag: 'CACHE', 
    icon: Zap, 
    color: 'text-cyan-400',
    description: 'High-speed in-memory caching'
  },
  { 
    category: 'queue', 
    label: 'Message Queue', 
    tag: 'QUEUE', 
    icon: ArrowLeftRight, 
    color: 'text-pink-400',
    description: 'Asynchronous message processing'
  },
  { 
    category: 'worker', 
    label: 'Background Worker', 
    tag: 'WORKER', 
    icon: Cpu, 
    color: 'text-indigo-400',
    description: 'Background job processing'
  },
  { 
    category: 'ai-agent', 
    label: 'AI Agent', 
    tag: 'AI', 
    icon: Crown, 
    color: 'text-amber-300',
    description: 'Autonomous AI agents and orchestrators'
  },
  { 
    category: 'auth', 
    label: 'Auth & Policy', 
    tag: 'AUTH', 
    icon: Shield, 
    color: 'text-red-400',
    description: 'Authentication and authorization'
  },
  { 
    category: 'note', 
    label: 'Architecture Memo', 
    tag: 'DOC', 
    icon: FileText, 
    color: 'text-zinc-400',
    description: 'Documentation and architecture notes'
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ theme, onAddNode, nodeCount, edgeCount }) => {
  const isDark = theme !== 'light';
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter components based on search query
  const filteredComponents = componentPalette.filter((component) => {
    const query = searchQuery.toLowerCase();
    return (
      component.label.toLowerCase().includes(query) ||
      component.tag.toLowerCase().includes(query) ||
      component.category.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query)
    );
  });

  return (
    <aside
      className={cn(
        `w-60 border-r flex flex-col justify-between p-3 z-20 select-none overflow-y-auto shrink-0`,
        isDark 
          ? 'bg-dark-surface border-dark-border text-text-secondary' 
          : 'bg-light-surface border-light-border text-zinc-800'
      )}
    >
      <div className="space-y-4">
        {/* Title Section */}
        <div className="flex items-center justify-between px-1">
          <span
            className={cn(
              'text-[11px] font-semibold uppercase tracking-wider',
              isDark ? 'text-text-muted' : 'text-zinc-500'
            )}
          >
            Component Library
          </span>
          <span
            className={cn(
              'text-[10px] font-mono',
              isDark ? 'text-text-muted' : 'text-zinc-500'
            )}
          >
            + Click to add
          </span>
        </div>

        {/* Search Input */}
        <div className="px-1">
          <Input
            theme={theme}
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="text-sm"
          />
        </div>

        {/* Component Groups */}
        <div className="space-y-1">
          {filteredComponents.length > 0 ? (
            filteredComponents.map((component, index) => {
              const Icon = component.icon;
              
              return (
                <Button
                  key={component.category}
                  variant="ghost"
                  theme={theme}
                  onClick={() => onAddNode(component.category)}
                  className={cn(
                    'w-full flex items-center justify-between p-2 rounded-lg border transition-all',
                    isDark
                      ? 'border-transparent hover:border-dark-border hover:bg-dark-surface-hover text-text-secondary hover:text-text-primary'
                      : 'border-transparent hover:border-light-border hover:bg-light-surface-hover text-zinc-700 hover:text-zinc-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        isDark 
                          ? 'bg-dark-surface-hover' 
                          : 'bg-light-surface-hover'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', component.color)} />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium block">
                        {component.label}
                      </span>
                      <span className="text-[10px] text-muted block">
                        {component.description}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded border',
                      isDark 
                        ? 'bg-dark-surface border-dark-border text-text-muted' 
                        : 'bg-light-surface border-light-border text-zinc-600'
                    )}
                  >
                    {component.tag}
                  </span>
                </Button>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted">No components found</p>
              <Button
                variant="ghost"
                size="sm"
                theme={theme}
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div
        className={cn(
          'pt-3 border-t space-y-1 text-xs font-mono px-1',
          isDark ? 'border-dark-border text-text-muted' : 'border-light-border text-zinc-600'
        )}
      >
        <div className="flex items-center justify-between text-[11px]">
          <span>Nodes: <strong className={isDark ? 'text-white' : 'text-black'}>{nodeCount}</strong></span>
          <span>Wires: <strong className={isDark ? 'text-white' : 'text-black'}>{edgeCount}</strong></span>
        </div>
        <p className="text-[10px] text-muted">
          Click canvas to add
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
