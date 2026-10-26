import React from 'react';

interface CapabilityRow {
  capability: string;
  behavior: string;
  boundary: string;
}

export const ComparisonSection: React.FC = () => {
  const rows: CapabilityRow[] = [
    {
      capability: 'Project scans',
      behavior: 'Run on the selected project folder on your device.',
      boundary: 'Bounded and static. They do not execute project code or upload source files to Formative.',
    },
    {
      capability: 'Architecture map',
      behavior: 'Shows supported source relationships and selected framework patterns.',
      boundary: 'Some links are inferences; runtime behavior and unsupported conventions may be missing.',
    },
    {
      capability: 'Agent Chat',
      behavior: 'Starts read-only Codex CLI or Claude Code CLI runs.',
      boundary: "Requires the provider's CLI and account. Prompt and selected context may be sent to that provider.",
    },
    {
      capability: 'Office chat',
      behavior: 'Can run a compatible GGUF model on this device.',
      boundary: 'The user supplies the model file. Small models can return generic or inaccurate answers.',
    },
    {
      capability: 'Project Office',
      behavior: 'Displays the project roster and supported live run activity.',
      boundary: 'Ambient animation is decorative; it is not evidence of agent work.',
    },
  ];

  return (
    <section id="capabilities" className="relative z-20 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Current scope
        </div>
        <h2 className="text-4xl sm:text-6xl font-heading italic text-white tracking-[-3px] leading-[0.95]">
          What Formative does today
        </h2>
        <p className="mt-4 text-base text-white/60 font-body font-light max-w-xl mx-auto">
          The useful boundaries matter as much as the features. Here is what the current app does, and where not to overread it.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#08080c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm font-body">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th scope="col" className="py-4 px-5 font-medium text-white/60 text-xs uppercase tracking-wider">Area</th>
                <th scope="col" className="py-4 px-5 font-medium text-white/60 text-xs uppercase tracking-wider">What it does</th>
                <th scope="col" className="py-4 px-5 font-medium text-white/60 text-xs uppercase tracking-wider">Limits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((row) => (
                <tr key={row.capability} className="align-top hover:bg-white/[0.02]">
                  <th scope="row" className="py-4 px-5 text-white font-medium text-sm">{row.capability}</th>
                  <td className="py-4 px-5 text-white/80 text-sm leading-relaxed">{row.behavior}</td>
                  <td className="py-4 px-5 text-white/55 text-sm leading-relaxed">{row.boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
