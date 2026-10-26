"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TimelineEntry {
  title: string;
  step: string;
  description: string;
  content: React.ReactNode;
}

export const Timeline = ({
  data,
  title = "How Formative Works",
  subtitle = "Screenshots are illustrative examples and may show sample project data; they do not show live user or agent activity.",
}: {
  data: TimelineEntry[];
  title?: string;
  subtitle?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 60%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section
      id="how-it-works"
      className="w-full bg-black font-body text-white relative py-20 px-4 sm:px-8 md:px-12"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <div className="liquid-glass rounded-full px-4 py-1 text-xs text-white/70 font-body inline-block mb-4">
          Workflow
        </div>
        <h2 className="text-4xl sm:text-6xl font-heading italic text-white tracking-[-3px] leading-tight max-w-4xl mx-auto">
          {title}
        </h2>
        <p className="text-white/60 text-sm sm:text-base font-light max-w-lg mx-auto mt-4">
          {subtitle}
        </p>
      </div>

      <div ref={ref} className="relative max-w-6xl mx-auto pb-10">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row justify-start pt-12 md:pt-24 gap-6 md:gap-12"
          >
            {/* Left Column: Step & Title */}
            <div className="sticky flex items-start z-30 top-36 self-start max-w-xs md:w-[320px] shrink-0">
              <div className="h-8 w-8 rounded-full liquid-glass border border-white/20 flex items-center justify-center text-xs font-mono text-white/80 shrink-0 mr-4">
                {item.step}
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-heading italic text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/50 font-light mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Content Card */}
            <div className="relative pl-12 md:pl-6 w-full">
              <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/[0.08] bg-[#08080c] shadow-2xl">
                {item.content}
              </div>
            </div>
          </div>
        ))}

        {/* Scroll Progress Beam */}
        <div
          style={{ height: height + "px" }}
          className="absolute left-4 md:left-4 top-0 overflow-hidden w-[2px] bg-white/[0.08]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-b from-white/40 via-white/80 to-transparent rounded-full"
          />
        </div>
      </div>
    </section>
  );
};
