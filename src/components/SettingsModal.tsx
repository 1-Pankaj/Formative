import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Cpu, 
  HardDrive, 
  Palette, 
  Shield, 
  Check, 
  RotateCcw,
  Sparkles,
  Bot
} from 'lucide-react';
import { ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'agent' | 'memory' | 'appearance'>('agent');
  const [claudePath, setClaudePath] = useState('~/.claude/transcripts');
  const [antigravityPath, setAntigravityPath] = useState('~/.gemini/antigravity/brain');
  const [memoryWindow, setMemoryWindow] = useState('20');
  const [autoSaveInterval, setAutoSaveInterval] = useState('30');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const isDark = theme !== 'light';

  const handleSave = () => {
    localStorage.setItem('formative_claude_path', claudePath);
    localStorage.setItem('formative_antigravity_path', antigravityPath);
    localStorage.setItem('formative_memory_window', memoryWindow);
    localStorage.setItem('formative_autosave_sec', autoSaveInterval);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className={`w-full max-w-2xl border rounded-xl shadow-2xl overflow-hidden flex flex-col ${
        isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black'
            }`}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Studio Preferences & Agent Memory
              </h3>
              <p className="text-xs text-zinc-400">
                Configure local agent paths, observation memory limits, and layout
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

        {/* Tab Bar */}
        <div className={`flex border-b px-6 text-xs font-medium gap-2 pt-2 ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-2 py-2 px-3 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'agent'
                ? isDark ? 'border-white text-white font-semibold' : 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Agent Connections</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 py-2 px-3 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'memory'
                ? isDark ? 'border-white text-white font-semibold' : 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Memory & Context</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 py-2 px-3 rounded-t-lg transition-all border-b-2 ${
              activeTab === 'appearance'
                ? isDark ? 'border-white text-white font-semibold' : 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance & Theme</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 min-h-[300px]">
          {activeTab === 'agent' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Claude Code Transcript Directory
                </label>
                <input
                  type="text"
                  value={claudePath}
                  onChange={(e) => setClaudePath(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-[#121215] border-[#27272a] text-zinc-200 focus:border-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-black'
                  }`}
                />
                <p className="text-[11px] text-zinc-500">
                  Formative monitors JSON lines in this directory for live coding tool executions with 0 API tokens consumed.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Google Antigravity Brain Directory
                </label>
                <input
                  type="text"
                  value={antigravityPath}
                  onChange={(e) => setAntigravityPath(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-[#121215] border-[#27272a] text-zinc-200 focus:border-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-black'
                  }`}
                />
                <p className="text-[11px] text-zinc-500">
                  Antigravity transcript root for live tool verification and subagent traces.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Step History Window (Nodes)
                </label>
                <input
                  type="number"
                  value={memoryWindow}
                  onChange={(e) => setMemoryWindow(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-[#121215] border-[#27272a] text-zinc-200 focus:border-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-black'
                  }`}
                />
                <p className="text-[11px] text-zinc-500">
                  Maximum number of recent agent reasoning steps to map onto the live canvas without cluttering view.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Auto-Save Interval (Seconds)
                </label>
                <input
                  type="number"
                  value={autoSaveInterval}
                  onChange={(e) => setAutoSaveInterval(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-[#121215] border-[#27272a] text-zinc-200 focus:border-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-black'
                  }`}
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Interface Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (theme !== 'dark') onToggleTheme();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      theme === 'dark'
                        ? 'border-white bg-[#18181c] text-white ring-1 ring-white/50'
                        : 'border-[#27272a] bg-[#121215] text-zinc-400'
                    }`}
                  >
                    <div className="text-sm font-semibold">Pitch Black (Paperclip)</div>
                    <div className="text-xs text-zinc-500 mt-1">Deep high-contrast studio mode</div>
                  </button>

                  <button
                    onClick={() => {
                      if (theme !== 'light') onToggleTheme();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      theme === 'light'
                        ? 'border-black bg-zinc-100 text-black ring-1 ring-black/50'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                    }`}
                  >
                    <div className="text-sm font-semibold">Clean Minimal (Light)</div>
                    <div className="text-xs text-zinc-400 mt-1">Daytime studio mode with crisp borders</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <span className="text-xs text-zinc-500">
            {saveSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Preferences Saved</span>
              </span>
            ) : (
              'Preferences persisted to local storage'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
