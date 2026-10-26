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
      title: "Local architecture map",
      description:
        "Build a bounded, read-only map from selected local source files. Imports are observed from code; some API and schema links are labeled as inferences. The map is separate from your editable canvas.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-white/[0.08]",
    },
    {
      title: "Project office",
      description:
        "See your project coordinator, enabled teammates, task assignments, and supported live agent runs. Ambient movement is decorative and does not claim work is happening.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-white/[0.08]",
    },
    {
      title: "Optional local office chat",
      description:
        "Choose a compatible GGUF file to use the local office chat. Model weights are not bundled by default; small models can give generic or inaccurate answers.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-white/[0.08]",
    },
    {
      title: "Understand the data boundary",
      description:
        "Project scans run locally and do not upload source files to Formative. Starting Codex or Claude Code may send your prompt and selected context to that provider.",
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
          A clearer workspace around your project.
        </h2>
        <p className="mt-4 text-base text-white/60 font-body font-light max-w-xl mx-auto">
          Keep project records together, inspect bounded source evidence, and follow supported agent runs without mixing them up with model chat or examples.
        </p>
        <p className="mt-3 text-xs text-white/40 font-body max-w-xl mx-auto">
          Screenshots are illustrative examples and may show sample project data; they do not show live user or agent activity.
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
          alt="Formative editable project canvas"
          className="w-full h-full object-cover object-left-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/70 text-xs px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span className="font-medium text-white">Editable project canvas</span>
          <span className="font-mono text-[11px] text-white/50">User-authored diagram</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/60 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span>Move · connect · label</span>
          <span className="text-white/90">Canvas is not a source scan</span>
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
          <span className="font-medium text-white">Three.js project office</span>
          <span className="font-mono text-[11px] text-white/50">Team set per project</span>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            <img src={officeRex} alt="Rex" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
            <img src={agentOtto} alt="Otto" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          </div>
          <span className="text-[11px] text-white/80 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
            Example characters
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
          <span className="font-medium text-white">Optional local model chat</span>
          <span className="font-mono text-[11px] text-white/50">User supplies GGUF</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/60 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span>Runs on this device</span>
          <span className="text-white/90">Answers can be inaccurate</span>
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
          alt="Formative project overview"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white/70 text-xs px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span className="font-medium text-white">Local scans · provider runs</span>
          <span className="font-mono text-[11px] text-white/50">No source upload to Formative</span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/60 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
          <span>CLI runs use the provider</span>
          <span className="text-white/90">No Formative account</span>
        </div>
      </div>
    </div>
  );
};
