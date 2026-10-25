import React, { useEffect, useState } from 'react';
import { 
  X, 
  FolderOpen, 
  FolderGit2, 
  Bot, 
  ArrowRight, 
  Plus, 
  Trash2,
  BookOpen,
  Terminal,
  Layers,
  Sparkles
} from './ui/FormativeGlyphs';
import { AgentSession, Project, AgentProvider, ProjectType, ThemeMode } from '../types';
import { SAMPLE_TEMPLATES } from '../data/defaultProjects';
import formativeLogo from '../assets/FormativeLogo.png';

interface LaunchpadModalProps {
  theme?: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  sessions: AgentSession[];
  selectedProvider: AgentProvider;
  onChangeProvider: (provider: AgentProvider) => void;
  onSelectSession: (session: AgentSession) => void;
  onScanDirectory: (path?: string) => void;
  onSelectCustomTranscript: () => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateBlankProject: (name: string, type: ProjectType) => void;
  onDeleteProject: (id: string) => void;
  onLoadTemplate?: (template: Project) => void;
}

export const LaunchpadModal: React.FC<LaunchpadModalProps> = ({
  theme = 'dark',
  isOpen,
  onClose,
  sessions,
  selectedProvider,
  onChangeProvider,
  onSelectSession,
  onScanDirectory,
  onSelectCustomTranscript,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateBlankProject,
  onDeleteProject,
  onLoadTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'workspaces' | 'ai-providers' | 'templates'>('workspaces');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('general');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    if (!activeProjectId && activeTab === 'ai-providers') setActiveTab('workspaces');
  }, [activeProjectId, activeTab]);

  if (!isOpen) return null;

  const isDark = theme !== 'light';

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateBlankProject(newProjectName.trim(), newProjectType);
    setNewProjectName('');
    setIsCreatingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className={`w-full max-w-3xl border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
        isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center p-1 border ${
              isDark ? 'bg-[#18181c] border-zinc-700/60' : 'bg-zinc-100 border-zinc-300'
            }`}>
              <img src={formativeLogo} alt="Formative" className="w-full h-full object-contain rounded" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Studio Launchpad & Settings
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Manage projects, inspect saved transcripts, and open starter examples
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider selection tabs */}
        <div className={`flex border-b px-6 text-xs font-medium gap-2 pt-2 ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <button
            onClick={() => setActiveTab('workspaces')}
            className={`flex items-center gap-2 py-2 px-3 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'workspaces'
                ? isDark ? 'border-white text-white font-semibold' : 'border-black text-black font-semibold'
                : `border-transparent ${isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'}`
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>

          <button
            disabled={!activeProjectId}
            onClick={() => setActiveTab('ai-providers')}
            title={activeProjectId ? 'Inspect saved transcripts in this project context' : 'Choose a project before opening transcripts'}
            className={`flex items-center gap-2 py-2 px-3 rounded-t-lg transition-all border-b-2 disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'ai-providers'
                ? isDark ? 'border-white text-white font-semibold' : 'border-black text-black font-semibold'
                : `border-transparent ${isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'}`
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{activeProjectId ? `Saved transcripts (${sessions.length})` : 'Choose a project for transcripts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 py-2 px-3 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'templates'
                ? isDark ? 'border-white text-white font-semibold' : 'border-black text-black font-semibold'
                : `border-transparent ${isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'}`
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Starter Examples</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: WORKSPACES */}
          {activeTab === 'workspaces' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Action A: Browse Folder */}
                <button
                  onClick={() => {
                    onScanDirectory();
                    onClose();
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isDark 
                      ? 'border-[#27272a] bg-[#121215] hover:border-zinc-500 hover:bg-[#18181c]' 
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-semibold">Open Local Folder</h4>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Scan an existing repository on disk to auto-map architecture.
                  </p>
                </button>

                {/* Action B: Create Blank Project */}
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isDark 
                      ? 'border-[#27272a] bg-[#121215] hover:border-zinc-500 hover:bg-[#18181c]' 
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold">New Blank Project</h4>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Start with an empty project canvas.
                  </p>
                </button>
              </div>

              {/* Inline Create Form */}
              {isCreatingNew && (
                <form onSubmit={handleCreateNew} className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'border-zinc-600 bg-[#18181c]' : 'border-zinc-300 bg-zinc-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold">Project name</h5>
                    <button type="button" onClick={() => setIsCreatingNew(false)} className={isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Payments Microservice"
                      autoFocus
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none ${
                        isDark ? 'bg-[#121215] border-[#27272a] text-white focus:border-white' : 'bg-white border-zinc-200 text-black focus:border-black'
                      }`}
                    />
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value as ProjectType)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none ${
                        isDark ? 'bg-[#121215] border-[#27272a] text-white focus:border-white' : 'bg-white border-zinc-200 text-black focus:border-black'
                      }`}
                    >
                      <option value="general">General System</option>
                      <option value="web">Web Application</option>
                      <option value="backend">Backend & APIs</option>
                      <option value="ai-system">AI System</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!newProjectName.trim()}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-40 ${
                        isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Projects List */}
              <div className="space-y-2 pt-2">
                <span className={`text-xs font-mono uppercase tracking-wider font-semibold block ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Projects ({projects.length})
                </span>

                {projects.length === 0 ? (
                  <div className={`p-8 rounded-xl border text-center text-sm text-zinc-400 ${
                    isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
                  }`}>
                    No projects yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {projects.map((p) => {
                      const isActive = p.id === activeProjectId;
                      return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            isActive
                              ? isDark ? 'border-white bg-[#18181c]' : 'border-black bg-zinc-100 shadow-xs'
                              : isDark ? 'border-[#27272a] bg-[#121215] hover:border-zinc-600' : 'border-zinc-200 bg-white hover:border-zinc-300'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate">{p.name}</span>
                            {p.source && (
                              <span className="text-[10px] font-mono uppercase text-zinc-500">
                                {p.source === 'folder-map' ? 'Folder map' : 'Example'}
                              </span>
                            )}
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase border ${
                                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                              }`}>
                                {p.type}
                              </span>
                            </div>
                            <p className={`text-xs truncate max-w-md ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                              {p.description || p.folderPath || 'Project'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono text-zinc-500 mr-1">
                              {p.nodes?.length || 0} {p.source === 'folder-map' ? 'items' : 'components'}
                            </span>
                            {!isActive && (
                              <button
                                onClick={() => {
                                  onSelectProject(p.id);
                                  onClose();
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                }`}
                              >
                                Open
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteProject(p.id)}
                              className="p-1.5 rounded text-zinc-400 hover:text-red-400 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI PROVIDERS */}
          {activeTab === 'ai-providers' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Agent session transcripts</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Choose a saved transcript to inspect. Formative does not start or control agent runs yet.
                </p>
              </div>

              {/* Provider Grid */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'claude-code', label: 'Claude Code' },
                  { id: 'opencode', label: 'OpenCode' },
                  { id: 'antigravity', label: 'Antigravity' },
                  { id: 'custom', label: 'Custom File' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onChangeProvider(p.id as AgentProvider)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      selectedProvider === p.id
                        ? isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                        : isDark ? 'border-[#27272a] bg-[#121215] text-zinc-400 hover:text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Sessions list */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Readable Transcripts ({sessions.length})
                  </span>
                  {selectedProvider === 'custom' && (
                    <button
                      onClick={onSelectCustomTranscript}
                      className={`text-xs hover:underline flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Browse Transcript File...</span>
                    </button>
                  )}
                </div>

                {sessions.length === 0 ? (
                  <div className={`p-8 rounded-xl border text-center space-y-2 ${
                    isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
                  }`}>
                    <Terminal className="w-8 h-8 text-zinc-500 mx-auto" />
                    <p className="text-sm font-semibold">No readable transcripts found</p>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Open an existing JSON or JSONL transcript to inspect its recorded activity.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold">{sess.title}</div>
                          <div className={`text-xs font-mono mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{sess.transcriptPath}</div>
                        </div>

                        <button
                          onClick={() => {
                            onSelectSession(sess);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                          }`}
                        >
                          Open transcript
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STARTER EXAMPLES */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Starter examples</h4>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Static diagrams you can edit. They are not generated from your project files.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold">{tmpl.name}</h5>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                        }`}>
                          {tmpl.type}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 max-w-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {tmpl.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onLoadTemplate) onLoadTemplate(tmpl);
                        onClose();
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                        isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      Open Example
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
