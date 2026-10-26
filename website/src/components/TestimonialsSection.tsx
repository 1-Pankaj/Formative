import React from 'react';
import { InfiniteMovingCards } from './ui/infinite-moving-cards';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote:
        "Formative indexed our 140-file TypeScript monorepo in less than four seconds. Being able to trace client routes down to database tables without uploading code to the cloud is a game changer for our security team.",
      name: "Marcus Vance",
      title: "Principal Systems Engineer",
    },
    {
      quote:
        "Having SmolLM2 embedded directly inside the installer executable means I can work on flights with zero internet. The local coworker answers questions about our routes with zero network latency.",
      name: "Sarah Chen",
      title: "Lead Backend Architect",
    },
    {
      quote:
        "The 3D office stage gives agent orchestration a tangible physical dimension. Seeing Rex and Otto coordinate task queues beats staring at endless raw JSON logs.",
      name: "Devin Brooks",
      title: "Senior Full-Stack Developer",
    },
    {
      quote:
        "We are strictly air-gapped on internal financial projects. Formative is the first modern AI-assisted engineering workspace that passes our strict zero-outbound-network compliance tests.",
      name: "Elena Rostova",
      title: "Fintech Security Director",
    },
  ];

  return (
    <section id="community" className="relative z-20 py-20 bg-black overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center mb-12">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Community
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading italic text-white tracking-[-2px] leading-tight max-w-3xl mx-auto">
          Built for teams who value privacy, speed, and clean code.
        </h2>
        <p className="mt-3 text-sm sm:text-base text-white/60 font-body font-light max-w-lg mx-auto">
          Hear how developers and systems architects use Formative to map complex repositories.
        </p>
      </div>

      <InfiniteMovingCards items={testimonials} speed="normal" direction="left" />
    </section>
  );
};
