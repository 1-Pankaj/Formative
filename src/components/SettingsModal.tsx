import React, { useEffect } from 'react';
import { Moon, Settings, Sun, X } from './ui/FormativeGlyphs';
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = theme !== 'light';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
        className={`w-full max-w-lg border rounded-xl shadow-2xl overflow-hidden flex flex-col ${
          isDark ? 'bg-[#09090b] border-[#27272a] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black'
            }`}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 id="preferences-title" className="text-sm font-semibold tracking-tight">Preferences</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Choose how Formative looks on this device.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preferences"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Appearance</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={isDark}
              onClick={() => { if (!isDark) onToggleTheme(); }}
              className={`p-4 rounded-xl border text-left transition-colors ${
                isDark
                  ? 'border-white bg-[#18181c] text-white ring-1 ring-white/50'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400'
              }`}
            >
              <Moon className="w-4 h-4 mb-2" />
              <span className="text-sm font-semibold block">Dark</span>
            </button>
            <button
              type="button"
              aria-pressed={!isDark}
              onClick={() => { if (isDark) onToggleTheme(); }}
              className={`p-4 rounded-xl border text-left transition-colors ${
                !isDark
                  ? 'border-black bg-zinc-100 text-black ring-1 ring-black/50'
                  : 'border-zinc-700 bg-[#121215] text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <Sun className="w-4 h-4 mb-2" />
              <span className="text-sm font-semibold block">Light</span>
            </button>
          </div>
          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Theme changes are saved on this device as you choose them.</p>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end ${
          isDark ? 'border-[#27272a] bg-[#121215]' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
};
