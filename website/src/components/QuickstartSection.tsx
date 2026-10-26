import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';

export const QuickstartSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'installer' | 'portable' | 'source'>('installer');
  const [copied, setCopied] = useState(false);

  const sourceCommands = `git clone https://github.com/1-Pankaj/Formative.git
cd Formative
npm install
npm run dev`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="download" className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Open Source Release
        </div>
        <h2 className="text-4xl sm:text-6xl font-heading italic text-white tracking-[-3px] leading-[0.95]">
          Get Formative for Windows.
        </h2>
        <p className="mt-4 text-base text-white/60 font-body font-light max-w-lg mx-auto">
          Free and open-source forever under the MIT license. Choose an executable or build directly from source.
        </p>
      </div>

      <div className="liquid-glass rounded-2xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('installer')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'installer'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Setup Installer
          </button>
          <button
            onClick={() => setActiveTab('portable')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'portable'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Portable (.exe)
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'source'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Build from Source
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'installer' && (
            <motion.div
              key="installer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-center"
            >
              <div className="max-w-lg mx-auto space-y-3">
                <h3 className="text-2xl font-heading italic text-white">
                  Windows Setup Installer
                </h3>
                <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                  Recommended for desktop use. Installs Formative with Desktop shortcut, Start Menu entry, and protocol handlers. Includes the bundled SmolLM2 270MB model.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <a
                  href="https://github.com/1-Pankaj/Formative/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg active:scale-95"
                >
                  <Icons.Download size={14} />
                  <span>Download Formative-Setup-1.0.0.exe</span>
                </a>
                <a
                  href="https://github.com/1-Pankaj/Formative/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-full border border-white/20 text-white/80 hover:text-white text-xs font-medium flex items-center justify-center gap-2 hover:border-white/40 transition-colors"
                >
                  <Icons.GitHub size={14} />
                  <span>View Release Notes</span>
                </a>
              </div>

              <div className="pt-4 flex items-center justify-center gap-6 text-[11px] text-white/40 font-mono">
                <span>SHA-256 Verified</span>
                <span>Windows 10 / 11 64-bit</span>
                <span>MIT License</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'portable' && (
            <motion.div
              key="portable"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-center"
            >
              <div className="max-w-lg mx-auto space-y-3">
                <h3 className="text-2xl font-heading italic text-white">
                  Standalone Portable (.exe)
                </h3>
                <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                  Zero installation required. Double-click to run anywhere—from any local folder, network share, or USB stick. Leaves no traces in Windows Registry.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <a
                  href="https://github.com/1-Pankaj/Formative/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg active:scale-95"
                >
                  <Icons.Download size={14} />
                  <span>Download Formative-Portable-1.0.0.exe</span>
                </a>
                <a
                  href="https://github.com/1-Pankaj/Formative/blob/master/SECURITY.md"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-full border border-white/20 text-white/80 hover:text-white text-xs font-medium flex items-center justify-center gap-2 hover:border-white/40 transition-colors"
                >
                  <Icons.SecurityShield size={14} />
                  <span>Security & Integrity</span>
                </a>
              </div>

              <div className="pt-4 flex items-center justify-center gap-6 text-[11px] text-white/40 font-mono">
                <span>Self-Contained Executable</span>
                <span>Air-Gapped Friendly</span>
                <span>No Admin Privileges Needed</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'source' && (
            <motion.div
              key="source"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-left max-w-xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-heading italic text-white">
                  Build Directly from Source
                </h3>
                <p className="text-xs sm:text-sm text-white/60 font-light">
                  Formative is 100% open source. Clone the repository and run in Vite development mode or build locally with Electron.
                </p>
              </div>

              <div className="relative rounded-xl border border-white/[0.08] bg-black/60 p-4 font-mono text-xs text-white/90">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3 text-white/40 text-[11px]">
                  <span>bash / powershell</span>
                  <button
                    onClick={() => copyToClipboard(sourceCommands)}
                    className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Icons.Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Icons.Copy size={12} />
                        <span>Copy commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-emerald-400/90 whitespace-pre leading-relaxed">
                  {sourceCommands}
                </pre>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 pt-2">
                <span>Requires Node.js 18+ and npm</span>
                <a
                  href="https://github.com/1-Pankaj/Formative/blob/master/CONTRIBUTING.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:underline flex items-center gap-1"
                >
                  Contributing Guide <Icons.ArrowUpRight size={11} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
