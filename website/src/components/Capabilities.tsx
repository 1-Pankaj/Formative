import React from 'react';
import { FadingVideo } from './FadingVideo';
import { Icons } from './Icons';

interface CapabilityCardProps {
  icon: keyof typeof Icons;
  tags: string[];
  title: string;
  description: string;
}

const CARDS: CapabilityCardProps[] = [
  {
    icon: 'ImageIcon',
    tags: ['Syntax-Tree', 'TypeScript', 'Routes & RPC', 'Canvas'],
    title: 'Syntax-Tree Maps',
    description:
      'We parse module boundaries, imports, and framework routes across local repositories without executing project code. Keep an architectural diagram perfectly synchronized with your actual source tree.',
  },
  {
    icon: 'MovieIcon',
    tags: ['SmolLM2-360M', '270MB GGUF', 'node-llama-cpp', 'Apache 2.0'],
    title: 'Offline Neural Core',
    description:
      'Bundled directly inside the executable. Operates on local CPU or Vulkan GPU with zero external network connectivity and zero token billing. Responds as a natural engineering teammate with zero AI slop.',
  },
  {
    icon: 'LightbulbIcon',
    tags: ['Claude Code CLI', 'Codex CLI', 'Read-Only', 'Telemetry'],
    title: 'Supervised Agents',
    description:
      'Connects to your local provider CLIs. Streams real-time tool calls, project search passes, and file diffs in a safe read-only plan mode, recording transcript histories automatically.',
  },
];

export const Capabilities: React.FC = () => {
  return (
    <section id="capabilities" className="relative min-h-screen overflow-hidden bg-black flex flex-col justify-between">
      {/* Background Cinematic Video with smooth fade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Atmospheric dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 z-0 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-12 flex flex-col justify-between min-h-screen">
        {/* Section Header */}
        <div className="mb-auto">
          <div className="text-sm font-body text-white/80 mb-6 font-light">
            // Capabilities
          </div>
          <h2 className="font-heading italic text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px] text-white whitespace-pre-line">
            Studio craft,{'\n'}end to end
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card, idx) => {
            const IconComp = Icons[card.icon];
            return (
              <div
                key={idx}
                className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300"
              >
                {/* Top Row: Icon + Right-Aligned Tags */}
                <div className="flex items-start justify-between gap-3">
                  <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0 text-white">
                    <IconComp size={22} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap font-light"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1 min-h-[40px]" />

                {/* Bottom Text Content */}
                <div>
                  <h3 className="font-heading italic text-3xl md:text-4xl tracking-[-1px] leading-none text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch] mt-3">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Release & Binary Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-white/70">
          <div className="flex items-center gap-3">
            <span className="font-heading italic text-lg text-white">Formative v1.0.0</span>
            <span className="text-white/40">•</span>
            <span>Windows Setup & Portable Executables</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/1-Pankaj/Formative/releases/latest"
              target="_blank"
              rel="noreferrer"
              className="liquid-glass-strong rounded-full px-4 py-2 text-xs font-medium text-white flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Get Windows Executable</span>
              <Icons.ArrowUpRight size={13} />
            </a>

            <a
              href="https://github.com/1-Pankaj/Formative"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
