import React from 'react';
import { 
  FolderOpen, 
  Plus, 
  Bot, 
  Trash2, 
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';
import { Project, ThemeMode } from '../types';
import formativeLogo from '../assets/FormativeLogo.png';

interface WelcomeScreenProps {
  theme: ThemeMode;
  projects: Project[];
  hasActiveProject: boolean;
  onOpenProject: (id: string) => void;
  onScanDirectory: () => void;
  onNewProject: () => void;
  onOpenAiTelemetry: () => void;
  onLoadTemplate: (template?: Project) => void;
  onOpenOnboarding: () => void;
  onDeleteProject?: (id: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  theme,
  projects,
  hasActiveProject,
  onOpenProject,
  onScanDirectory,
  onNewProject,
  onOpenAiTelemetry,
  onLoadTemplate,
  onOpenOnboarding,
  onDeleteProject,
}) => {
  const isDark = theme !== 'light';

  return (
    <div className={`flex-1 h-full overflow-y-auto px-8 py-10 ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Paperclip Top Branding Banner */}
        <div className={`pb-6 border-b flex items-center justify-between ${
          isDark ? 'border-[#27272a]' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center p-1.5 shadow-sm border ${
              isDark ? 'bg-[#18181c] border-zinc-700/60' : 'bg-zinc-100 border-zinc-300'
            }`}>
              <img src={formativeLogo} alt="Formative Studio" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Formative Studio
              </h1>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                Projects, tasks, project canvases, and saved transcripts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenOnboarding}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                isDark 
                  ? 'border-[#27272a] bg-[#121215] text-zinc-300 hover:text-white hover:bg-zinc-800' 
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Getting started</span>
            </button>

            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* 2-Column Desktop Setup Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Recent projects */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400">
                Projects ({projects.length})
              </span>
            </div>

            {projects.length === 0 ? (
              <div className={`p-8 rounded-xl border text-center space-y-2.5 ${
                isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
              }`}>
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <Layers className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold">
                  No projects yet
                </p>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Open a project folder or start with a blank project or labeled example.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onNewProject}
                    className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm"
                  >
                    + Create First Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className={`group relative rounded-xl border transition-all ${
                      isDark
                        ? 'border-[#27272a] bg-[#121215] hover:border-zinc-500 hover:bg-[#18181c]'
                        : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white shadow-xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenProject(proj.id)}
                      aria-label={`Open project ${proj.name}`}
                      className="flex w-full min-w-0 items-center gap-3.5 px-3.5 py-3.5 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
                      }`}>
                        {proj.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-semibold group-hover:underline">
                            {proj.name}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                            isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                          }`}>
                            {(proj.type || 'general').replace(/-/g, ' ')}
                          </span>
                          {proj.source && (
                            <span className={`shrink-0 text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                              {proj.source === 'folder-map' ? 'Folder map' : 'Example'}
                            </span>
                          )}
                        </span>
                        <span className={`mt-0.5 block max-w-sm truncate text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          {proj.description || `${proj.nodes?.length || 0} canvas items`}
                        </span>
                      </span>
                      <span className={`hidden shrink-0 font-mono text-xs lg:block ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                        {proj.nodes?.length || 0} canvas items
                      </span>
                    </button>
                    {onDeleteProject && (
                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                          isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-red-400' : 'text-zinc-600 hover:bg-zinc-100 hover:text-red-600'
                        }`}
                        title="Remove project"
                        aria-label={`Remove ${proj.name} from Formative`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Actions and starter examples */}
          <div className="space-y-6">
            {/* Start Section */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400 block">
                Start a project
              </span>

              <div className="space-y-2">
                {/* Open Folder */}
                <button
                  onClick={onScanDirectory}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isDark
                      ? 'border-[#27272a] bg-[#121215] hover:border-zinc-500 hover:bg-[#18181c]'
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Open Local Folder...</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Create a limited folder map. It does not analyze dependencies.</div>
                    </div>
                  </div>
                </button>

                {/* New Project */}
                <button
                  onClick={onNewProject}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isDark
                      ? 'border-[#27272a] bg-[#121215] hover:border-zinc-500 hover:bg-[#18181c]'
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">New Project...</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Start with a blank canvas or a labeled example</div>
                    </div>
                  </div>
                </button>

                {/* Open saved agent activity after selecting a project */}
                <button
                  type="button"
                  disabled={!hasActiveProject}
                  onClick={onOpenAiTelemetry}
                  title={hasActiveProject ? 'Inspect saved agent transcripts for this project' : 'Choose a project first'}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all disabled:opacity-45 disabled:cursor-not-allowed ${
                    isDark
                      ? 'border-[#27272a] bg-[#121215] hover:border-zinc-500 hover:bg-[#18181c]'
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Saved transcripts</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{hasActiveProject ? 'Open a JSON or JSONL transcript to read recorded activity. This does not start an agent.' : 'Choose a project first to inspect a transcript.'}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Static starter diagrams */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-400 block">
                Starter Examples
              </span>

              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Full-Stack Web Platform</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">A static sample diagram. It is not generated from a project.</p>
                  </div>
                  <button
                    onClick={() => onLoadTemplate()}
                    className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all shrink-0"
                  >
                    Open Example
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
