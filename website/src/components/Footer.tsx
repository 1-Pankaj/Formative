import React from 'react';
import { Icons } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050608] py-16 px-4 text-xs font-mono text-ink-muted">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand to-brand-active flex items-center justify-center">
              <img src="./assets/FormativeLogo.png" alt="Formative" className="w-4 h-4 object-contain" />
            </div>
            <span className="font-bold text-white tracking-tight text-sm">Formative Studio</span>
          </div>
          <p className="font-sans text-xs text-ink-muted max-w-sm leading-relaxed">
            Desktop-first open-source workspace for architecture diagrams, local agent orchestration (Claude Code, Codex), and interactive 3D office collaboration.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-ink-secondary">v1.0.0 Public Beta — Built in Public</span>
          </div>
        </div>

        {/* Links Column 1: Workspace */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="text-white font-semibold text-xs mb-3">WORKBENCH</div>
          <div><a href="#architecture" className="hover:text-white transition-colors">Architecture Map</a></div>
          <div><a href="#local-llm" className="hover:text-white transition-colors">Offline SmolLM2</a></div>
          <div><a href="#telemetry" className="hover:text-white transition-colors">Agent CLI Telemetry</a></div>
          <div><a href="#office" className="hover:text-white transition-colors">3D Office Floor</a></div>
        </div>

        {/* Links Column 2: Governance & Open Source */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="text-white font-semibold text-xs mb-3">OPEN SOURCE</div>
          <div><a href="https://github.com/1-Pankaj/Formative/blob/master/LICENSE" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">MIT License</a></div>
          <div><a href="https://github.com/1-Pankaj/Formative/blob/master/THIRD_PARTY_NOTICES.md" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Third-Party Notices</a></div>
          <div><a href="https://github.com/1-Pankaj/Formative/blob/master/CONTRIBUTING.md" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Contributing</a></div>
          <div><a href="https://github.com/1-Pankaj/Formative/blob/master/SECURITY.md" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Security Policy</a></div>
        </div>

        {/* Links Column 3: Community */}
        <div className="md:col-span-3 space-y-2.5">
          <div className="text-white font-semibold text-xs mb-3">RELEASES & CODE</div>
          <div><a href="https://github.com/1-Pankaj/Formative/releases" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Windows Releases (.exe)</a></div>
          <div><a href="https://github.com/1-Pankaj/Formative" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></div>
          <div><a href="https://github.com/1-Pankaj/Formative/issues" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Issue Tracker</a></div>
          <div><a href="https://github.com/1-Pankaj/Formative/blob/master/CHANGELOG.md" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Changelog</a></div>
        </div>
      </div>

      {/* Trademark Disclaimer & Bottom Strip */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-muted">
        <div>
          © 2026 Formative Studio Contributors. Distributed under the MIT License.
        </div>
        <div className="text-center sm:text-right max-w-md text-[10px] opacity-75">
          Anthropic, Claude, Claude Code, OpenAI, and Codex marks belong to their respective owners and identify supported integrations.
        </div>
      </div>
    </footer>
  );
};
