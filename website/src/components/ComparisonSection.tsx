import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './Icons';

interface ComparisonRow {
  feature: string;
  formative: string;
  traditional: string;
  highlight?: boolean;
}

export const ComparisonSection: React.FC = () => {
  const rows: ComparisonRow[] = [
    {
      feature: 'Codebase Privacy & Telemetry',
      formative: '0 KB transmitted. 100% air-gapped on local hardware.',
      traditional: 'Code, prompts, and file paths uploaded to cloud servers.',
      highlight: true,
    },
    {
      feature: 'Offline Operation',
      formative: 'Fully functional with WiFi off (bundled SmolLM2 model).',
      traditional: 'Fails immediately without active internet access.',
      highlight: true,
    },
    {
      feature: 'Living Architecture Map',
      formative: 'Automatic visual graph of pages, endpoints, and schemas.',
      traditional: 'None. Developers must hold mental models across files.',
    },
    {
      feature: 'Local AI Coworker Floor',
      formative: 'Procedural 3D office stage with 23 assigned specialist roles.',
      traditional: 'Flat chat interface with generic bot identity.',
    },
    {
      feature: 'Agent Execution Safety',
      formative: 'Supervised sandboxing with visual diff preview before writes.',
      traditional: 'Unattended scripts can mutate files without review.',
    },
    {
      feature: 'Licensing & Monthly Costs',
      formative: '100% Free, Permissive MIT License. Zero subscriptions.',
      traditional: '$20 – $40+ per seat every month with usage quotas.',
      highlight: true,
    },
  ];

  return (
    <section id="compare" className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Open Source vs Cloud Vendors
        </div>
        <h2 className="text-4xl sm:text-6xl font-heading italic text-white tracking-[-3px] leading-[0.95]">
          Architected for privacy and control.
        </h2>
        <p className="mt-4 text-base text-white/60 font-body font-light max-w-xl mx-auto">
          See why engineers and security teams choose Formative over closed, subscription-based cloud AI tools.
        </p>
      </div>

      <div className="liquid-glass rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-body">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="py-5 px-6 font-medium text-white/50 text-xs uppercase tracking-wider w-1/3">
                  Capability
                </th>
                <th className="py-5 px-6 font-medium text-white text-base w-1/3 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="font-heading italic text-xl">Formative Studio</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Local
                    </span>
                  </div>
                </th>
                <th className="py-5 px-6 font-medium text-white/50 text-xs uppercase tracking-wider w-1/3">
                  Cloud AI Assistants
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-white/[0.02] ${
                    row.highlight ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  <td className="py-5 px-6 text-white font-medium text-sm">
                    {row.feature}
                  </td>
                  <td className="py-5 px-6 text-white/90 text-sm font-normal bg-white/[0.02]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icons.Check size={12} />
                      </div>
                      <span className="leading-relaxed">{row.formative}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-white/50 text-sm font-light">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/[0.05] text-white/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs">✕</span>
                      </div>
                      <span className="leading-relaxed">{row.traditional}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
