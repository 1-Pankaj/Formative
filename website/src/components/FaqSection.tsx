import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Does every part of Formative work offline?",
      answer:
        "Project structure and architecture scans run locally. Office chat also runs locally after you select a compatible GGUF model. Starting a Codex CLI or Claude Code CLI run uses that provider's service, so it generally needs a network connection and may incur provider charges.",
    },
    {
      question: "Is Formative open source, and can providers charge me?",
      answer:
        "Formative is MIT-licensed and has no Formative account, subscription, or paid feature gates. Codex or Claude usage is governed by your provider account and may have its own limits or charges.",
    },
    {
      question: "What project data is sent to a service?",
      answer:
        "The local scans do not upload source files to Formative. When you start a provider run, the prompt and the context shown for that run may be sent to the provider. Review the selected project and task before starting.",
    },
    {
      question: "Is a local AI model included?",
      answer:
        "No. GGUF weights are not in this repository or included in default Windows packages. In the desktop app, choose a compatible model file in Project Office. Formative copies it to local app data and runs it on this device. Model output can be inaccurate.",
    },
    {
      question: "Can the connected coding agent change my files?",
      answer:
        "The current Agent Chat workflow starts supported Codex CLI and Claude Code CLI runs in read-only mode. It does not offer write-enabled runs or a file-approval workflow. Provider tools and permissions can change, so check the provider status and current settings before each run.",
    },
    {
      question: "Does the browser preview have access to local project files?",
      answer:
        "No. The browser preview can demonstrate renderer screens, but selecting local folders, importing transcripts, adding a model, and starting installed CLI agents require the Windows desktop app.",
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
          What runs locally, what uses a provider, and what is included in a release.
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
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
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
                    <div id={`faq-answer-${idx}`} className="px-5 sm:px-6 pb-6 text-xs sm:text-sm font-body font-light text-white/70 leading-relaxed border-t border-white/[0.04] pt-4">
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
