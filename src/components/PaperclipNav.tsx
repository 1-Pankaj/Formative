/**
 * Formative Studio - Redesigned Navigation Component
 * 
 * A modern, clean navigation sidebar with proper design system integration.
 */

import React, { useState } from 'react';
import {
  ListChecks,
  Activity,
  Crown,
  Network,
  Layers,
  Briefcase,
  BookOpen,
  Plus,
  Moon,
  Sun,
  ChevronDown,
  Check,
  Search,
  Bot,
  Sliders,
  HelpCircle,
  Settings,
  ExternalLink,
  Terminal,
  Cpu,
  Globe,
  Home,
  FileText,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Project, ViewMode, ThemeMode, SkillDepartment } from '../types';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from './ui/dropdown-menu';
import { cn, getInitials } from '../lib/utils';
import formativeLogo from '../assets/FormativeLogo.png';

interface PaperclipNavProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string) => void;
  onOpenNewProject: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenGuide: () => void;
  onOpenLaunchpad: () => void;
  onOpenSettings?: () => void;
  isAiStreaming?: boolean;
  activeSkills?: SkillDepartment[];
  onOpenSkills?: () => void;
}

// Navigation sections configuration
const navSections = [
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Network,
    mode: 'architecture' as ViewMode,
  },
  {
    id: 'agent-flow',
    label: 'AI Console',
    icon: Bot,
    mode: 'agent-flow' as ViewMode,
  },
  {
    id: 'operations-floor',
    label: 'Office Floor',
    icon: Terminal,
    mode: 'operations-floor' as ViewMode,
  },
  {
    id: 'org-chart',
    label: 'Org Chart',
    icon: Users,
    mode: 'org-chart' as ViewMode,
  },
  {
    id: 'issues',
    label: 'Tasks',
    icon: ListChecks,
    mode: 'issues' as ViewMode,
  },
];

// Bottom navigation items
const bottomNavItems = [
  {
    id: 'guide',
    label: 'Guide',
    icon: BookOpen,
    action: 'openGuide',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    action: 'openSettings',
  },
];

export const PaperclipNav: React.FC<PaperclipNavProps> = ({
  theme,
  onToggleTheme,
  projects,
  activeProject,
  onSelectProject,
  onOpenNewProject,
  viewMode,
  onChangeViewMode,
  onOpenGuide,
  onOpenLaunchpad,
  onOpenSettings,
  isAiStreaming = false,
  activeSkills = [],
  onOpenSkills,
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const isDark = theme === 'dark';

  // Count active skills
  const activeSkillCount = activeSkills.length;

  // Handle navigation item click
  const handleNavClick = (mode: ViewMode | null) => {
    if (mode) {
      onChangeViewMode(mode);
    }
  };

  // Handle bottom nav actions
  const handleBottomAction = (action: string) => {
    switch (action) {
      case 'openGuide':
        onOpenGuide();
        break;
      case 'openSettings':
        onOpenSettings?.();
        break;
    }
  };

  return (
    <aside
      className={cn(
        `flex h-full select-none shrink-0 z-30 transition-colors`,
        isDark ? 'bg-dark-background border-r border-dark-border' : 'bg-light-background border-r border-light-border'
      )}
    >
      {/* LEFT: SLIM ICON RAIL */}
      <div
        className={cn(
          `w-14 h-full flex flex-col items-center py-3 border-r justify-between`,
          isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'
        )}
      >
        {/* Top: Logo Badge */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Logo Badge - Formative */}
          <Button
            variant="ghost"
            size="nav"
            theme={theme}
            onClick={() => onChangeViewMode('welcome')}
            title="Formative Home"
            className="hover:bg-surface-hover"
          >
            <img
              src={formativeLogo}
              alt="Formative"
              className="w-8 h-8 rounded-lg object-contain"
            />
          </Button>

          <div
            className={cn(
              `w-6 h-[1px]`,
              isDark ? 'bg-dark-border' : 'bg-light-border'
            )}
          />

          {/* Main Navigation Icons */}
          <div className="flex flex-col items-center gap-1 w-full">
            {navSections.map((section) => {
              const isActive = viewMode === section.mode;
              const Icon = section.icon;
              
              return (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="nav"
                  theme={theme}
                  onClick={() => handleNavClick(section.mode)}
                  title={section.label}
                  className={cn(
                    'relative transition-all',
                    isActive 
                      ? 'bg-brand-primary text-white hover:bg-brand-primary-hover' 
                      : 'hover:bg-surface-hover',
                    isDark 
                      ? 'text-text-secondary hover:text-text-primary' 
                      : 'text-zinc-600 hover:text-zinc-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-primary rounded-r-lg" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Bottom: Theme Toggle & Extras */}
        <div className="flex flex-col items-center gap-2 w-full">
          <div
            className={cn(
              `w-6 h-[1px]`,
              isDark ? 'bg-dark-border' : 'bg-light-border'
            )}
          />

          {/* AI Streaming Indicator */}
          {isAiStreaming && (
            <Button
              variant="ghost"
              size="nav"
              theme={theme}
              title="AI Agent Active"
              className="relative"
            >
              <Activity className="w-5 h-5 text-brand-primary animate-pulse" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-brand-primary rounded-full border-2 border-dark-background dark:border-light-background" />
            </Button>
          )}

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="nav"
                theme={theme}
                title="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-text-secondary" />
                ) : (
                  <Moon className="w-5 h-5 text-zinc-600" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent theme={theme} align="center">
                <DropdownMenuItem theme={theme} onClick={onToggleTheme}>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>

          {/* Bottom Navigation */}
          <div className="flex flex-col items-center gap-1 w-full pt-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="nav"
                  theme={theme}
                  onClick={() => handleBottomAction(item.action)}
                  title={item.label}
                  className={cn(
                    isDark 
                      ? 'text-text-tertiary hover:text-text-secondary' 
                      : 'text-zinc-500 hover:text-zinc-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: PROJECT SIDEBAR */}
      <div className="flex flex-col h-full w-48 p-3 overflow-y-auto">
        {/* Current Project Section */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                theme={theme}
                className={cn(
                  'w-full justify-between',
                  isDark 
                    ? 'border-dark-border hover:border-dark-border-strong' 
                    : 'border-light-border hover:border-light-border-strong'
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {activeProject ? (
                    <>
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold',
                          isDark 
                            ? 'bg-dark-surface-hover text-dark-text-primary' 
                            : 'bg-light-surface-hover text-zinc-900'
                        )}
                      >
                        {getInitials(activeProject.name, 2)}
                      </div>
                      <span className="truncate text-sm">
                        {activeProject.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center',
                          isDark 
                            ? 'bg-dark-surface-hover' 
                            : 'bg-light-surface-hover'
                        )}
                      >
                        <Home className="w-4 h-4" />
                      </div>
                      <span className="truncate text-sm">
                        Formative
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform'
                  )}
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <DropdownMenuContent theme={theme} className="w-44">
                {/* Recent Projects */}
                {projects.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted">
                      Recent Workspaces
                    </div>
                    {projects.slice(0, 5).map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        theme={theme}
                        onClick={() => {
                          onSelectProject(project.id);
                          onChangeViewMode('architecture');
                        }}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold',
                            isDark 
                              ? 'bg-dark-surface-hover text-dark-text-secondary' 
                              : 'bg-light-surface-hover text-zinc-700'
                          )}
                        >
                          {getInitials(project.name, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{project.name}</span>
                          <span className="text-xs text-muted">
                            {project.type || 'workspace'}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                {/* Actions */}
                <DropdownMenuItem
                  theme={theme}
                  onClick={() => {
                    onOpenNewProject();
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Workspace</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  theme={theme}
                  onClick={() => {
                    onOpenLaunchpad();
                  }}
                  className="flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Open Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mb-4">
          <Button
            variant="secondary"
            size="sm"
            theme={theme}
            onClick={onOpenNewProject}
            className="w-full justify-start gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            theme={theme}
            onClick={onOpenLaunchpad}
            className="w-full justify-start gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Open Workspace</span>
          </Button>
        </div>

        {/* Active Skills Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Active Skills
            </h3>
          </div>

          {activeSkillCount > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeSkills.map((skill) => (
                <span
                  key={skill}
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-medium',
                    'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                  )}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted italic">
              No skills active
            </p>
          )}

          {onOpenSkills && (
            <Button
              variant="ghost"
              size="sm"
              theme={theme}
              onClick={onOpenSkills}
              className="w-full mt-2 text-xs"
            >
              + Add Skills
            </Button>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            theme={theme}
            onClick={onOpenGuide}
            className="w-full justify-start gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Guide</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            theme={theme}
            onClick={onOpenSettings}
            className="w-full justify-start gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default PaperclipNav;
