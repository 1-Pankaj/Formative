import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Do I need an active internet connection to run Formative?",
      answer:
        "No. Formative is designed to run 100% offline. The bundled SmolLM2 neural model, syntax analyzers, and 3D office stage execute entirely on your computer's CPU or GPU with zero outbound network requests.",
    },
    {
      question: "Is Formative completely free and open source?",
      answer:
        "Yes. Formative is free software released under the permissive MIT license. There are no subscriptions, no token usage fees, and no feature paywalls.",
    },
    {
      question: "Does Formative execute project code when scanning my files?",
      answer:
        "No. Formative uses fast static code analysis. It reads declarations and file imports without ever running code or installing packages, keeping your machine completely safe from untrusted scripts.",
    },
    {
      question: "What is the difference between the Installer and Portable versions?",
      answer:
        "The Windows Setup Installer (.exe) sets up standard desktop shortcuts and start menu integration. The Standalone Portable (.exe) runs immediately from any folder or USB drive with zero installation and leaves no system registry entries.",
    },
    {
      question: "Can I control which files AI agents can modify?",
      answer:
        "Yes. All CLI agent hooks (such as Claude Code and Codex) run under strict supervised sandboxing. Proposed file edits and diffs are shown in a visual inspector for your explicit approval before anything is written to disk.",
    },
  ];

  return (
    <section id="faq" className="relative z-20 py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-white/[0.06]">
      <div className="text-center mb-12">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Frequently Asked Questions
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading italic text-white tracking-[-2px] leading-tight">
          Common Questions
        </h2>
        <p className="mt-3 text-sm sm:text-base text-white/60 font-body font-light max-w-md mx-auto">
          Everything you need to know about Formative's architecture, local AI, and privacy.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="liquid-glass rounded-2xl border border-white/[0.08] bg-[#08080c] overflow-hidden transition-colors hover:border-white/20"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <span className="text-base sm:text-lg font-heading italic text-white tracking-tight">
                  {faq.question}
                </span>
                <span className="text-white/60 text-lg font-mono shrink-0">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm font-body font-light text-white/70 leading-relaxed border-t border-white/[0.04] pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
