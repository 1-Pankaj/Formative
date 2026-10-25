import React from 'react';
import { Bot, FolderOpen, RefreshCw, FileText, Terminal } from './ui/FormativeGlyphs';
import { AgentSession, AgentProvider, ThemeMode } from '../types';

interface TelemetryConnectViewProps {
  theme: ThemeMode;
  selectedProvider: AgentProvider;
  onChangeProvider: (prov: AgentProvider) => void;
  sessions: AgentSession[];
  onSelectSession: (sess: AgentSession) => void;
  onRefreshSessions: () => void;
  onSelectCustomFile: () => void;
}

export const TelemetryConnectView: React.FC<TelemetryConnectViewProps> = ({
  theme,
  selectedProvider,
  onChangeProvider,
  sessions,
  onSelectSession,
  onRefreshSessions,
  onSelectCustomFile,
}) => {
  const isDark = theme !== 'light';

  // Strictly filter sessions to match the currently selected agent provider
  const filteredSessions = React.useMemo(() => {
    if (selectedProvider === 'custom') return sessions;
    return sessions.filter((sess) => {
      if (selectedProvider === 'antigravity') {
        return sess.provider === 'Antigravity' || (sess.transcriptPath && sess.transcriptPath.includes('.gemini'));
      }
      if (selectedProvider === 'claude-code') {
        return sess.provider === 'Claude Code' || (sess.transcriptPath && sess.transcriptPath.includes('.claude'));
      }
      if (selectedProvider === 'opencode') {
        return sess.provider === 'OpenCode' || (sess.transcriptPath && sess.transcriptPath.includes('.opencode'));
      }
      return true;
    });
  }, [sessions, selectedProvider]);

  const providerLabel = selectedProvider === 'antigravity' ? 'Antigravity' : selectedProvider === 'claude-code' ? 'Claude Code' : selectedProvider === 'opencode' ? 'OpenCode' : 'Custom File';

  return (
    <div className={`flex-1 h-full overflow-y-auto p-8 flex items-center justify-center ${
      isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      <div className={`w-full max-w-2xl border rounded-xl p-6 space-y-6 shadow-xl ${
        isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
      }`}>
        {/* Header */}
        <div className={`space-y-1.5 pb-4 border-b ${
          isDark ? 'border-[#27272a]' : 'border-zinc-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">
                  Saved transcripts
                </h2>
                <p className="text-xs text-zinc-400">
                  Choose a local transcript to read its recorded activity. This does not connect to or control the agent.
                </p>
              </div>
            </div>

            <button
              onClick={onRefreshSessions}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDark 
                  ? 'border-[#27272a] bg-[#18181c] text-zinc-300 hover:text-white hover:bg-zinc-800' 
                  : 'border-zinc-200 bg-white text-zinc-700 hover:text-black hover:bg-zinc-100'
              }`}
              title="Look for readable transcript files in this provider's local session folders"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh list</span>
            </button>
          </div>
        </div>

        {/* Provider Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
            Transcript Source
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'claude-code', label: 'Claude Code' },
              { id: 'opencode', label: 'OpenCode' },
              { id: 'antigravity', label: 'Antigravity' },
              { id: 'custom', label: 'Custom File' },
            ].map((p) => {
              const isSelected = selectedProvider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onChangeProvider(p.id as AgentProvider)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    isSelected
                      ? isDark
                        ? 'bg-white text-black border-white shadow-xs'
                        : 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : isDark
                      ? 'border-[#27272a] bg-[#18181c] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:text-black hover:border-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sessions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              {providerLabel} Transcripts ({filteredSessions.length})
            </label>
            {selectedProvider === 'custom' && (
              <button
                onClick={onSelectCustomFile}
                className={`text-xs hover:underline flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Browse Transcript File...</span>
              </button>
            )}
          </div>

          {filteredSessions.length === 0 ? (
            <div className={`p-8 rounded-xl border text-center space-y-3 ${
              isDark ? 'border-[#27272a] bg-[#18181c]' : 'border-zinc-200 bg-white'
            }`}>
              <Terminal className="w-8 h-8 text-zinc-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">No readable {providerLabel} transcripts found</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Choose a saved JSON or JSONL transcript. Formative will watch that file for new entries, but it will not run or control the agent. The open transcript is not saved to this project.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onSelectCustomFile}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
                >
                  Choose a transcript file
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredSessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isDark
                      ? 'border-[#27272a] bg-[#18181c] hover:border-zinc-500 hover:bg-zinc-800/60'
                      : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{sess.title}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5 truncate">{sess.transcriptPath}</div>
                    </div>
                  </div>

                  <button type="button" onClick={() => onSelectSession(sess)} className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold shrink-0">
                    Open transcript
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
