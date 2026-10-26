"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Import real app assets
import officeRex from "@/assets/office-rex.png";
import agentOtto from "@/assets/agent-otto.png";
import chatDialogue from "@/assets/chat-dialogue.png";
import canvasScreen from "@/assets/formative-canvas-screen.png";
import officeScreen from "@/assets/formative-office-screen.png";
import chatScreen from "@/assets/formative-chat-screen.png";
import overviewScreen from "@/assets/formative-overview-screen.png";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "Automatic Visual Code Map",
      description:
        "Formative scans your project files and automatically draws a visual diagram of your app. See your frontend pages, API endpoints, database schemas, and imports in one zoomable view.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-white/[0.08]",
    },
    {
      title: "Interactive 3D Office Floor",
      description:
        "Meet your project specialists on a procedural 3D spatial floor. Teammate activity visually reflects real agent work, research, and file edits.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-white/[0.08]",
    },
    {
      title: "Built-In AI Assistant, No Monthly Fees",
      description:
        "Chat with your project assistant powered by the bundled SmolLM2 model. Ask questions about your code with instant local responses, no API keys, and zero subscriptions.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-white/[0.08]",
    },
    {
      title: "100% Private, Works Offline",
      description:
        "Your code never leaves your computer. Formative sends 0 bytes to remote cloud servers, requires no login or account, and works with airplane mode turned on.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none border-white/[0.08]",
    },
  ];

  return (
    <div id="features" className="relative z-20 mx-auto max-w-7xl py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Features
        </div>
        <h2 className="text-4xl sm:text-6xl font-heading italic text-white tracking-[-3px] leading-[0.95]">
          Everything you need to navigate and understand your code.
        </h2>
        <p className="mt-4 text-base text-white/60 font-body font-light max-w-xl mx-auto">
          Built for developers and teams who want a clear picture of their codebase without complexity or privacy compromises.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 rounded-2xl lg:grid-cols-6 border border-white/[0.08] bg-[#08080c] liquid-glass overflow-hidden shadow-2xl">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`relative overflow-hidden p-6 sm:p-8 flex flex-col justify-between`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl text-left text-2xl sm:text-3xl font-heading italic tracking-tight text-white leading-tight">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="my-3 max-w-md text-left text-sm font-body font-light text-white/60 leading-relaxed">
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex h-72 sm:h-80 w-full flex-col justify-between mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a10] text-xs font-body group">
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={canvasScreen}
          alt="Formative Living Architecture Canvas"
          className="w-full h-full object-cover object-left-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/70 text-xs px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span className="font-medium text-white">Living Architecture Blueprint</span>
          <span className="font-mono text-[11px] text-white/50">Local Project Canvas</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/60 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span>TypeScript · Python · Rust · Go</span>
          <span className="text-white/90">Interactive Zoom & Pan</span>
        </div>
      </div>
    </div>
  );
};

export const SkeletonTwo = () => {
  return (
    <div className="relative flex h-72 sm:h-80 w-full flex-col justify-between mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a10] text-xs font-body group">
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={officeScreen}
          alt="Formative 3D Office Floor"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-transparent to-black/20 pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/70 text-xs px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span className="font-medium text-white">Three.js 3D Spatial Floor</span>
          <span className="font-mono text-[11px] text-white/50">23 Specialists</span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            <img src={officeRex} alt="Rex" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
            <img src={agentOtto} alt="Otto" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          </div>
          <span className="text-[11px] text-white/80 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
            Active Teammates
          </span>
        </div>
      </div>
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex h-64 sm:h-72 w-full flex-col justify-between mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a10] text-xs font-body group">
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={chatScreen}
          alt="Formative Agent Chat Interface"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/70 text-xs px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span className="font-medium text-white">Local SmolLM2 Teammates</span>
          <span className="font-mono text-[11px] text-white/50">Zero Monthly Fees</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/60 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span>Codex · Claude Code · Antigravity</span>
          <span className="text-white/90">Instant Local Replies</span>
        </div>
      </div>
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="relative flex h-64 sm:h-72 w-full flex-col justify-between mt-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a10] text-xs font-body group">
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={overviewScreen}
          alt="Formative Air-Gapped Project Overview"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/70 text-xs px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span className="font-medium text-white">100% Air-Gapped Operation</span>
          <span className="font-mono text-[11px] text-white/50">0 KB Cloud Sync</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/60 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span>Airplane Mode Compatible</span>
          <span className="text-white/90">No Account Required</span>
        </div>
      </div>
    </div>
  );
};
