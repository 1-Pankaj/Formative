import React, { useState } from 'react';
import { Icons } from './Icons';

const repositoryUrl = 'https://github.com/1-Pankaj/Formative';
const releasesUrl = `${repositoryUrl}/releases`;
const sourceCommands = `git clone ${repositoryUrl}.git
cd Formative
npm ci
npm run desktop`;

export const QuickstartSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sourceCommands);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="download" className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Get started
        </div>
        <h2 className="text-4xl sm:text-6xl font-heading italic text-white tracking-[-3px] leading-[0.95]">
          Source first. Releases when published.
        </h2>
        <p className="mt-4 text-base text-white/60 font-body font-light max-w-xl mx-auto">
          Formative is MIT-licensed. Check GitHub Releases for current Windows builds, or run the desktop app from source.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.08] bg-[#08080c] p-6 sm:p-8" aria-labelledby="source-start-title">
          <h3 id="source-start-title" className="text-2xl font-heading italic text-white">Run from source</h3>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Use Node.js 22 LTS or newer and npm. The desktop command builds the renderer, then opens Electron.
          </p>
          <div className="relative mt-5 rounded-xl border border-white/[0.08] bg-black/60 p-4 font-mono text-xs text-white/90">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06] mb-3 text-white/50 text-[11px]">
              <span>PowerShell or a POSIX shell</span>
              <button
                type="button"
                onClick={() => void copyToClipboard()}
                aria-label={copied ? 'Commands copied' : 'Copy setup commands'}
                className="flex items-center gap-1.5 text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                {copied ? <Icons.Check size={12} /> : <Icons.Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy commands'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre leading-relaxed text-emerald-300">{sourceCommands}</pre>
          </div>
          <a
            href={`${repositoryUrl}/blob/master/CONTRIBUTING.md`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            Read the contributing guide <Icons.ArrowUpRight size={13} />
          </a>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#08080c] p-6 sm:p-8" aria-labelledby="releases-title">
          <h3 id="releases-title" className="text-2xl font-heading italic text-white">Windows builds</h3>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            The source defines installer and portable package targets. The Releases page shows whether a tested build is currently published; this page does not promise that an asset is available.
          </p>
          <a
            href={releasesUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            <Icons.GitHub size={15} />
            Check GitHub Releases
          </a>
          <p className="mt-5 border-t border-white/[0.08] pt-4 text-xs text-white/50 leading-relaxed">
            Default packages omit GGUF model weights. Office chat requires a compatible model selected in the desktop app.
          </p>
        </section>
      </div>
    </section>
  );
};
