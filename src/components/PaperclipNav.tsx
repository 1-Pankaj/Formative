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
  Globe
} from 'lucide-react';
import { Project, ViewMode, ThemeMode, SkillDepartment } from '../types';
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
  const isDark = theme !== 'light';

  return (
    <aside className={`flex h-full select-none shrink-0 z-30 transition-colors ${
      isDark ? 'bg-[#09090b] border-r border-[#27272a]' : 'bg-[#fafafa] border-r border-zinc-200'
    }`}>
      {/* 1. SLIM 52px ICON RAIL */}
      <div className={`w-[52px] h-full flex flex-col items-center py-3 border-r justify-between ${
        isDark ? 'bg-[#0c0c0e] border-[#27272a]' : 'bg-[#f4f4f5] border-zinc-200'
      }`}>
        {/* Top: Logo Badge & Workspaces */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Logo Badge - Formative */}
          <button
            onClick={() => onChangeViewMode('welcome')}
            title="Formative Home / Welcome Screen"
            className="w-8 h-8 rounded-lg bg-[#18181c] border border-zinc-700/60 flex items-center justify-center p-1 shadow-xs hover:scale-105 active:scale-95 transition-transform overflow-hidden"
          >
            <img src={formativeLogo} alt="Formative" className="w-full h-full object-contain rounded" />
          </button>

          <div className={`w-6 h-[1px] ${isDark ? 'bg-[#27272a]' : 'bg-zinc-200'}`} />

          {/* Project Workspace Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            {projects.slice(0, 5).map((p) => {
              const isActive = activeProject?.id === p.id;
              const initial = p.name.charAt(0).toUpperCase() || 'P';
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    if (viewMode === 'welcome') onChangeViewMode('architecture');
                  }}
                  title={p.name}
                  className={`relative w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-[#27272a] text-white ring-1 ring-zinc-400'
                        : 'bg-zinc-900 text-white shadow-sm'
                      : isDark
                      ? 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -left-1.5 w-1 h-4 bg-white rounded-r-full" />
                  )}
                  {initial}
                </button>
              );
            })}

            <button
              onClick={onOpenNewProject}
              title="Create New Project"
              className={`w-8 h-8 rounded-lg border border-dashed flex items-center justify-center transition-all ${
                isDark 
                  ? 'border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 hover:bg-zinc-900' 
                  : 'border-zinc-300 text-zinc-500 hover:text-black hover:border-zinc-400 hover:bg-zinc-100'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Rail Actions: Theme, Guide, Hub, Settings */}
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Interactive Guide 101 */}
          <button
            onClick={onOpenGuide}
            title="Interactive Learning Guide & Architecture 101"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark 
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark 
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Preferences & Agent Memory"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDark 
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Workspace Launchpad */}
          <button
            onClick={onOpenLaunchpad}
            title="Studio Launchpad"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isDark 
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                : 'text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PRIMARY SIDEBAR (220px) */}
      <div className="w-[220px] h-full flex flex-col justify-between overflow-hidden">
        {/* Top: Project Dropdown Header */}
        <div className="p-3 border-b flex-shrink-0 relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
              isDark 
                ? 'bg-[#121215] border-[#27272a] hover:border-zinc-700 text-zinc-100' 
                : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${activeProject ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              <span className="text-xs font-semibold truncate">
                {activeProject ? activeProject.name : 'Select Workspace'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
          </button>

          {/* Project Switcher Dropdown */}
          {isProjectDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProjectDropdownOpen(false)} 
              />
              <div className={`absolute top-12 left-3 right-3 z-50 rounded-xl border shadow-xl p-1.5 text-xs ${
                isDark ? 'bg-[#18181c] border-[#27272a] text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
              }`}>
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Workspaces
                </div>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setIsProjectDropdownOpen(false);
                      if (viewMode === 'welcome') onChangeViewMode('architecture');
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${
                      activeProject?.id === p.id
                        ? isDark ? 'bg-zinc-800 text-white font-medium' : 'bg-zinc-100 text-black font-medium'
                        : isDark ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {activeProject?.id === p.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
                <div className={`my-1 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`} />
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    onOpenNewProject();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Workspace...</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Scrollable Nav Sections */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          {/* Section: WORK */}
          <div>
            <div className="px-2 mb-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Work
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onChangeViewMode('issues')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'issues'
                    ? isDark ? 'bg-[#27272a] text-white font-semibold' : 'bg-zinc-200 text-black font-semibold'
                    : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ListChecks className="w-4 h-4 text-blue-400" />
                  <span>Tasks & Issues</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                  isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {activeProject?.issues?.length || 3}
                </span>
              </button>

              <button
                onClick={() => onChangeViewMode('agent-flow')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'agent-flow'
                    ? isDark ? 'bg-[#27272a] text-white font-semibold' : 'bg-zinc-200 text-black font-semibold'
                    : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>AI Agent Console</span>
                </div>
                {isAiStreaming && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Section: AGENTS */}
          <div>
            <div className="px-2 mb-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
              <span>Agents</span>
              <span className="text-[10px] text-zinc-500">1 Online</span>
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onChangeViewMode('operations-floor')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'operations-floor'
                    ? isDark ? 'bg-[#27272a] text-white font-semibold' : 'bg-zinc-200 text-black font-semibold'
                    : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>CEO Orchestrator</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </button>

              <div 
                onClick={onOpenSkills}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]/50 cursor-pointer transition-colors"
                title="Specialist Skills"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-zinc-500" />
                  <span>Specialists ({activeSkills.length} active)</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Config</span>
              </div>
            </div>
          </div>

          {/* Section: ARCHITECTURE & VIEWS */}
          <div>
            <div className="px-2 mb-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Architecture & Views
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => onChangeViewMode('architecture')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'architecture'
                    ? isDark ? 'bg-[#27272a] text-white font-semibold' : 'bg-zinc-200 text-black font-semibold'
                    : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Component Canvas</span>
                </div>
              </button>

              <button
                onClick={() => onChangeViewMode('org-chart')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'org-chart'
                    ? isDark ? 'bg-[#27272a] text-white font-semibold' : 'bg-zinc-200 text-black font-semibold'
                    : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Network className="w-4 h-4 text-purple-400" />
                  <span>Org Chart</span>
                </div>
              </button>

              <button
                onClick={() => onChangeViewMode('operations-floor')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'operations-floor'
                    ? isDark ? 'bg-[#27272a] text-white font-semibold' : 'bg-zinc-200 text-black font-semibold'
                    : isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>CEO Office Floor</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section: LEARNING */}
          <div>
            <div className="px-2 mb-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Learn
            </div>
            <div className="space-y-0.5">
              <button
                onClick={onOpenGuide}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isDark ? 'text-zinc-400 hover:text-white hover:bg-[#18181b]' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Architecture 101</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom User / Info Footer */}
        <div className={`p-3 border-t text-xs flex items-center justify-between ${
          isDark ? 'border-[#27272a] text-zinc-400' : 'border-zinc-200 text-zinc-600'
        }`}>
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              U
            </div>
            <span className="truncate text-xs font-mono">Operator</span>
          </div>

          <div className="flex items-center gap-1">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="Settings"
                className="p-1 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onOpenGuide}
              title="Help & Guide"
              className="p-1 hover:text-white transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
