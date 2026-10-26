import React from 'react';
import { TextHoverEffect } from './ui/text-hover-effect';
import { Icons } from './Icons';
import { FormativeLogo } from './FormativeLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black border-t border-white/[0.08] pt-20 pb-10 px-6 sm:px-10 lg:px-16 overflow-hidden text-sm font-body">
      {/* Top Grid matching user screenshot */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-16">
        {/* Left Column: Brand & Copyright */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center p-1 border border-white/10 overflow-hidden">
              <FormativeLogo className="h-full w-full object-contain" withBackground={true} />
            </div>
            <span className="font-heading italic text-3xl font-bold text-white tracking-tight">
              Formative
            </span>
          </div>

          <p className="text-xs font-light text-white/60 max-w-sm leading-relaxed">
            Desktop-first open-source workspace for architecture diagrams, local agent orchestration (Claude Code, Codex), and interactive 3D office collaboration.
          </p>

          <div className="text-xs font-light text-white/40 pt-2 font-mono">
            © copyright Formative 2026. All rights reserved.
          </div>
        </div>

        {/* Right Columns: Pages, Socials, Legal, Downloads */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs font-light">
          {/* Column 1: Workspace */}
          <div className="space-y-3">
            <div className="text-white font-medium text-sm font-body">Workspace</div>
            <div><a href="#preview" className="text-white/60 hover:text-white transition-colors">Macbook Preview</a></div>
            <div><a href="#features" className="text-white/60 hover:text-white transition-colors">Visual Architecture Map</a></div>
            <div><a href="#features" className="text-white/60 hover:text-white transition-colors">3D Office Floor</a></div>
            <div><a href="#privacy" className="text-white/60 hover:text-white transition-colors">Air-Gapped Privacy</a></div>
            <div><a href="#compare" className="text-white/60 hover:text-white transition-colors">Architecture Comparison</a></div>
            <div><a href="#download" className="text-white/60 hover:text-white transition-colors">Download Executables</a></div>
          </div>

          {/* Column 2: Socials & Code */}
          <div className="space-y-3">
            <div className="text-white font-medium text-sm font-body">Socials & Code</div>
            <div><a href="https://github.com/1-Pankaj/Formative" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">GitHub</a></div>
            <div><a href="https://github.com/1-Pankaj/Formative/releases" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">Releases</a></div>
            <div><a href="https://github.com/1-Pankaj/Formative/issues" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">Issue Tracker</a></div>
            <div><a href="https://github.com/1-Pankaj/Formative/blob/master/CHANGELOG.md" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">Changelog</a></div>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-3">
            <div className="text-white font-medium text-sm font-body">Legal</div>
            <div><a href="https://github.com/1-Pankaj/Formative/blob/master/LICENSE" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">MIT License</a></div>
            <div><a href="https://github.com/1-Pankaj/Formative/blob/master/THIRD_PARTY_NOTICES.md" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">Third-Party Notices</a></div>
            <div><a href="https://github.com/1-Pankaj/Formative/blob/master/SECURITY.md" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">Security Policy</a></div>
            <div><a href="https://github.com/1-Pankaj/Formative/blob/master/CODE_OF_CONDUCT.md" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors">Code of Conduct</a></div>
          </div>

          {/* Column 4: Download */}
          <div className="space-y-3">
            <div className="text-white font-medium text-sm font-body">Downloads</div>
            <div><a href="https://github.com/1-Pankaj/Formative/releases/latest" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">Setup Installer <Icons.ArrowUpRight size={11} /></a></div>
            <div><a href="https://github.com/1-Pankaj/Formative/releases/latest" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">Portable .exe <Icons.ArrowUpRight size={11} /></a></div>
            <div><span className="text-white/40 font-mono">v1.0.0 Public Beta</span></div>
            <div><span className="text-white/40 font-mono">Windows 10 / 11</span></div>
          </div>
        </div>
      </div>

      {/* Massive Giant Typography Watermark with Text Hover Effect (Matching user image) */}
      <div className="relative w-full max-w-7xl mx-auto pt-8 border-t border-white/[0.06]">
        <TextHoverEffect text="FORMATIVE" />
      </div>

      {/* Bottom Trademark disclaimer */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-light text-white/40">
        <div>
          Formative is free and open-source software licensed under MIT.
        </div>
        <div>
          Anthropic, Claude, Claude Code, OpenAI, and Codex marks belong to their respective owners.
        </div>
      </div>
    </footer>
  );
};
