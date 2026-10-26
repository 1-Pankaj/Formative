import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none transition-all duration-300">
      <nav 
        className={`pointer-events-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 rounded-full border transition-all duration-300 shadow-2xl ${
          scrolled 
            ? 'bg-[#0a0b10]/85 backdrop-blur-xl border-white/[0.12] shadow-black/80 max-w-4xl w-full' 
            : 'bg-[#0d0e15]/60 backdrop-blur-md border-white/[0.07] max-w-5xl w-full'
        }`}
      >
        {/* Logo and Product Title */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-brand to-brand-active shadow-md shadow-brand/20 group-hover:scale-105 transition-transform duration-200">
            <img src="./assets/FormativeLogo.png" alt="Formative" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight text-sm sm:text-base">Formative</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-brand/10 text-brand border border-brand/25">
              v1.0.0 Beta
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-xs font-medium text-ink-muted">
          <a href="#architecture" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors">
            Architecture
          </a>
          <a href="#local-llm" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors">
            Local LLM
          </a>
          <a href="#telemetry" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors">
            Agent CLI
          </a>
          <a href="#office" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors">
            3D Office
          </a>
          <a href="https://github.com/1-Pankaj/Formative" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-1.5">
            Docs
            <Icons.ExternalLink size={12} className="opacity-70" />
          </a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/1-Pankaj/Formative"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-ink-secondary bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white transition-all duration-200"
          >
            <Icons.GitHub size={14} />
            <span className="hidden sm:inline">Star on GitHub</span>
          </a>

          <a
            href="#download"
            className="relative group overflow-hidden px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-brand hover:bg-brand-hover active:scale-95 transition-all duration-200 shadow-lg shadow-brand/25"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Icons.Windows size={13} />
              <span>Download</span>
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg text-ink-muted hover:text-white hover:bg-white/5"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="pointer-events-auto md:hidden fixed top-20 inset-x-4 p-4 rounded-2xl bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-3 text-sm font-medium">
          <a 
            href="#architecture" 
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-white/5 text-ink-secondary"
          >
            Architecture Map
          </a>
          <a 
            href="#local-llm" 
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-white/5 text-ink-secondary"
          >
            Offline Local LLM
          </a>
          <a 
            href="#telemetry" 
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-white/5 text-ink-secondary"
          >
            Agent CLI Telemetry
          </a>
          <a 
            href="#office" 
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-white/5 text-ink-secondary"
          >
            3D Office Simulation
          </a>
          <a 
            href="https://github.com/1-Pankaj/Formative" 
            target="_blank" 
            rel="noreferrer" 
            className="px-3 py-2 rounded-lg hover:bg-white/5 text-ink-secondary flex items-center justify-between"
          >
            <span>GitHub Repository</span>
            <Icons.ExternalLink size={14} />
          </a>
        </div>
      )}
    </header>
  );
};
