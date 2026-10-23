import React from 'react';
import { 
  FolderGit2, 
  Plus, 
  Save, 
  Layers, 
  Cpu, 
  FolderOpen, 
  Maximize2,
  Home,
  Bot,
  Building2,
  HelpCircle,
  Unplug,
  Sun,
  Moon,
  LayoutGrid
} from 'lucide-react';
import { Project, ViewMode, FlowLayout, ThemeMode } from '../types';
import formativeLogo from '../assets/FormativeLogo.png';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string) => void;
  onOpenNewProject: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  flowLayout: FlowLayout;
  onChangeFlowLayout: (layout: FlowLayout) => void;
  onAutoLayout: () => void;
  onFitView: () => void;
  onOpenLaunchpad: () => void;
  onOpenOnboarding: () => void;
  isAiStreaming: boolean;
  activeProviderName?: string;
  onDisconnectAi?: () => void;
  onSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  projects,
  activeProject,
  onSelectProject,
  onOpenNewProject,
  viewMode,
  onChangeViewMode,
  flowLayout,
  onChangeFlowLayout,
  onAutoLayout,
  onFitView,
  onOpenLaunchpad,
  onOpenOnboarding,
  isAiStreaming,
  activeProviderName,
  onDisconnectAi,
  onSave,
}) => {
  const isDark = theme !== 'light';
  const hasActiveProject = !!activeProject;

  return (
    <header className={`h-11 border-b px-3 flex items-center justify-between z-30 select-none text-xs ${
      isDark 
        ? 'bg-[#1e1e1e] border-[#2d2d2d] text-[#cccccc]' 
        : 'bg-[#f3f3f3] border-[#e7e7e7] text-[#1e1e1e]'
    }`}>
      {/* Left: Desktop Window Branding & Tabs */}
      <div className="flex items-center gap-3">
        {/* Formative Desktop Branding */}
        <div 
          onClick={() => onChangeViewMode('welcome')}
          className="flex items-center gap-2 cursor-pointer group"
          title="Return to Welcome Hub"
        >
          <img 
            src={formativeLogo} 
            alt="Formative" 
            className="w-5 h-5 object-contain rounded" 
          />
          <span className={`font-semibold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Formative
          </span>
          {activeProject && (
            <span className={`text-[11px] font-mono ${isDark ? 'text-[#858585]' : 'text-[#616161]'}`}>
              — {activeProject.name}
            </span>
          )}
        </div>

        <div className={`h-4 w-[1px] ${isDark ? 'bg-[#3e3e42]' : 'bg-[#e7e7e7]'}`} />

        {/* Desktop View Tabs */}
        <div className={`flex items-center rounded p-0.5 border ${
          isDark ? 'bg-[#252526] border-[#3e3e42]' : 'bg-[#e7e7e7] border-[#d4d4d4]'
        }`}>
          {/* Welcome Tab */}
          <button
            onClick={() => onChangeViewMode('welcome')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'welcome'
                ? isDark ? 'bg-[#1e1e1e] text-white shadow-xs' : 'bg-white text-black shadow-xs'
                : 'text-[#858585] hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Welcome</span>
          </button>

          {/* Workspace Tab (Only active if project is loaded) */}
          <button
            disabled={!hasActiveProject}
            onClick={() => {
              if (hasActiveProject) {
                onChangeViewMode('architecture');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              !hasActiveProject 
                ? 'opacity-40 cursor-not-allowed text-[#858585]'
                : viewMode === 'architecture'
                  ? isDark ? 'bg-[#1e1e1e] text-white shadow-xs' : 'bg-white text-black shadow-xs'
                  : 'text-[#858585] hover:text-white'
            }`}
            title={hasActiveProject ? 'Architecture Canvas' : 'Open a workspace first'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>

          {/* Operations Floor Tab (Only active if project is loaded) */}
          <button
            disabled={!hasActiveProject}
            onClick={() => {
              if (hasActiveProject) {
                onChangeViewMode('operations-floor');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              !hasActiveProject 
                ? 'opacity-40 cursor-not-allowed text-[#858585]'
                : viewMode === 'operations-floor'
                  ? isDark ? 'bg-[#1e1e1e] text-white shadow-xs' : 'bg-white text-black shadow-xs'
                  : 'text-[#858585] hover:text-white'
            }`}
            title={hasActiveProject ? 'Operations Floor (2D Studio)' : 'Open a workspace first'}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Operations Floor</span>
          </button>

          {/* AI Flight Tab (Only active if project is loaded) */}
          <button
            disabled={!hasActiveProject}
            onClick={() => {
              if (hasActiveProject) {
                onChangeViewMode('agent-flow');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              !hasActiveProject 
                ? 'opacity-40 cursor-not-allowed text-[#858585]'
                : viewMode === 'agent-flow'
                  ? isDark ? 'bg-[#1e1e1e] text-white shadow-xs' : 'bg-white text-black shadow-xs'
                  : 'text-[#858585] hover:text-white'
            }`}
            title={hasActiveProject ? 'Live Telemetry' : 'Open a workspace first'}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Flight</span>
          </button>
        </div>

        {/* Project Selector dropdown (when projects exist) */}
        {projects.length > 0 && (
          <div className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 rounded px-2 py-0.5 border text-xs ${
              isDark ? 'bg-[#252526] border-[#3e3e42]' : 'bg-white border-[#e7e7e7]'
            }`}>
              <FolderGit2 className="w-3.5 h-3.5 text-[#E04418]" />
              <select
                value={activeProject?.id || ''}
                onChange={(e) => onSelectProject(e.target.value)}
                className={`bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer max-w-[150px] truncate ${
                  isDark ? 'text-white' : 'text-black'
                }`}
              >
                {projects.map((p) => (
                  <option 
                    key={p.id} 
                    value={p.id} 
                    className={isDark ? 'bg-[#252526] text-white' : 'bg-white text-black'}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenNewProject}
              className={`p-1 rounded border transition-colors ${
                isDark 
                  ? 'bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-white hover:bg-[#2d2d2d]' 
                  : 'bg-white border-[#e7e7e7] text-[#616161] hover:text-black hover:bg-[#e7e7e7]'
              }`}
              title="Create New Architecture Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Center: In AI Flight Mode -> Flow Layout Switcher */}
      {viewMode === 'agent-flow' && isAiStreaming && (
        <div className={`flex items-center rounded p-0.5 border text-xs ${
          isDark ? 'bg-[#252526] border-[#3e3e42]' : 'bg-[#e7e7e7] border-[#d4d4d4]'
        }`}>
          <button
            onClick={() => onChangeFlowLayout('tree')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              flowLayout === 'tree' 
                ? isDark ? 'bg-[#1e1e1e] text-white font-medium' : 'bg-white text-black font-medium'
                : 'text-[#858585] hover:text-white'
            }`}
          >
            Column Flow
          </button>
          <button
            onClick={() => onChangeFlowLayout('timeline')}
            className={`px-2.5 py-0.5 rounded transition-colors ${
              flowLayout === 'timeline' 
                ? isDark ? 'bg-[#1e1e1e] text-white font-medium' : 'bg-white text-black font-medium'
                : 'text-[#858585] hover:text-white'
            }`}
          >
            Timeline Flow
          </button>
        </div>
      )}

      {/* Right: AI Telemetry Status, Canvas Tools, Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Agent Telemetry Live Status */}
        {isAiStreaming ? (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono ${
            isDark ? 'bg-[#252526] border-[#3e3e42] text-[#cccccc]' : 'bg-white border-[#e7e7e7] text-[#333333]'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Telemetry: {activeProviderName || 'Active'}</span>
            {onDisconnectAi && (
              <button
                onClick={onDisconnectAi}
                className="ml-1 text-[#858585] hover:text-rose-400 p-0.5 transition-colors"
                title="Disconnect Telemetry"
              >
                <Unplug className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onChangeViewMode('agent-flow')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition-colors ${
              isDark 
                ? 'bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-white hover:border-[#555]' 
                : 'bg-white border-[#e7e7e7] text-[#616161] hover:text-black hover:border-[#ccc]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#E04418]" />
            <span>Connect Telemetry</span>
          </button>
        )}

        {/* Canvas Tools (Visible in Workspace Mode) */}
        {viewMode === 'architecture' && (
          <>
            <button
              onClick={onAutoLayout}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-white hover:bg-[#2d2d2d]' 
                  : 'bg-white border-[#e7e7e7] text-[#616161] hover:text-black hover:bg-[#e7e7e7]'
              }`}
              title="Organize Layout"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#E04418]" />
              <span>Tidy</span>
            </button>

            <button
              onClick={onFitView}
              className={`p-1 rounded border transition-colors ${
                isDark 
                  ? 'bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-white hover:bg-[#2d2d2d]' 
                  : 'bg-white border-[#e7e7e7] text-[#616161] hover:text-black hover:bg-[#e7e7e7]'
              }`}
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Tutorial / Guide */}
        <button
          onClick={onOpenOnboarding}
          className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-colors ${
            isDark 
              ? 'bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-white hover:bg-[#2d2d2d]' 
              : 'bg-white border-[#e7e7e7] text-[#616161] hover:text-black hover:bg-[#e7e7e7]'
          }`}
          title="Open Setup Guide"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Guide</span>
        </button>

        {/* Theme Toggle Button (VS Code Dark / Light) */}
        <button
          onClick={onToggleTheme}
          className={`p-1.5 rounded border transition-colors ${
            isDark 
              ? 'bg-[#252526] border-[#3e3e42] text-[#E04418] hover:bg-[#2d2d2d]' 
              : 'bg-white border-[#e7e7e7] text-[#475569] hover:bg-[#e7e7e7]'
          }`}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Workspace Hub */}
        <button
          onClick={onOpenLaunchpad}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
            isDark 
              ? 'bg-[#252526] border-[#3e3e42] text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white' 
              : 'bg-white border-[#e7e7e7] text-[#1e1e1e] hover:bg-[#e7e7e7]'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Hub</span>
        </button>

        {/* Save Blueprint Button */}
        {viewMode === 'architecture' && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#E04418] hover:bg-[#F25224] text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        )}
      </div>
    </header>
  );
};
