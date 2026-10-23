/**
 * Formative Studio - Redesigned Header Component
 * 
 * A modern header bar with proper design system integration.
 */

import React from 'react';
import { Layers, Activity, Network, Maximize2, Save, BookOpen, Crown, Plus, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';
import { ViewMode, ThemeMode, Project } from '../types';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface HeaderProps {
  theme: ThemeMode;
  activeProject: Project | null;
  viewMode: ViewMode;
  nodes: any[];
  edges: any[];
  isAiStreaming: boolean;
  activeSession: any | null;
  onAutoLayout: () => void;
  onFitView: () => void;
  onSave: () => void;
  onOpenGuide: () => void;
  onOpenNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  activeProject,
  viewMode,
  nodes,
  edges,
  isAiStreaming,
  activeSession,
  onAutoLayout,
  onFitView,
  onSave,
  onOpenGuide,
  onOpenNewProject,
}) => {
  const isDark = theme === 'dark';

  // Get view mode label
  const getViewModeLabel = () => {
    switch (viewMode) {
      case 'architecture':
        return 'Architecture Canvas';
      case 'agent-flow':
        return 'AI Agent Console';
      case 'org-chart':
        return 'Org Chart';
      case 'issues':
        return 'Tasks & Issues';
      case 'operations-floor':
        return 'CEO Office Floor';
      case 'welcome':
        return 'Welcome';
      default:
        return 'Formative';
    }
  };

  return (
    <header
      className={cn(
        `h-12 border-b px-5 flex items-center justify-between shrink-0 select-none z-20`,
        isDark 
          ? 'bg-dark-background border-dark-border text-text-secondary' 
          : 'bg-light-background border-light-border text-zinc-800'
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Button
          variant="ghost"
          size="sm"
          theme={theme}
          onClick={onOpenNewProject}
          className="font-medium text-text-secondary hover:text-text-primary"
        >
          {activeProject ? activeProject.name : 'Formative'}
        </Button>
        <span className="text-muted">/</span>
        <span
          className={cn(
            'font-semibold',
            isDark ? 'text-text-primary' : 'text-zinc-900'
          )}
        >
          {getViewModeLabel()}
        </span>
      </div>

      {/* Right: Context Actions */}
      <div className="flex items-center gap-2">
        {viewMode === 'architecture' && activeProject && (
          <>
            <Button
              variant="outline"
              size="sm"
              theme={theme}
              onClick={onAutoLayout}
              title="Align architecture into a non-overlapping tree layout"
              className="flex items-center gap-1.5"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Tidy Layout</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              theme={theme}
              onClick={onFitView}
              title="Fit view to all components"
              className="flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              theme={theme}
              onClick={onSave}
              title="Save architecture"
              className="flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </Button>
          </>
        )}

        {viewMode === 'org-chart' && (
          <div
            className={cn(
              'text-xs px-3 py-1 rounded-full border flex items-center gap-2',
              isDark 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            )}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Single-Agent CEO Orchestrator</span>
          </div>
        )}

        {/* Quick Guide Button */}
        <Button
          variant="outline"
          size="sm"
          theme={theme}
          onClick={onOpenGuide}
          title="Open Architecture Guide 101"
          className="flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Guide 101</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
