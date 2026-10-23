import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Navigation, Layers, Cpu, Check } from 'lucide-react';
import { ThemeMode } from '../types';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

const tutorialSteps = [
  {
    step: 1,
    title: 'Visual Architecture Canvas',
    icon: Navigation,
    desc: 'Map and organize your software systems, microservices, and dependencies on an infinite desktop canvas.',
    points: [
      'Pan smoothly: Hold Spacebar and click-drag anywhere on the canvas.',
      'Zoom: Use your mouse scroll wheel or trackpad pinch gesture.',
      'Select and arrange: Drag a bounding box over nodes to reposition them.',
      'Auto-organize: Use the Tidy button in the toolbar to automatically align and route connections.',
    ],
  },
  {
    step: 2,
    title: 'Components & Blueprints',
    icon: Layers,
    desc: 'Add clean, standardized components for frontends, APIs, databases, message queues, and workers.',
    points: [
      'Click any component from the Left Palette to place it directly on your canvas.',
      'Connect components: Drag a wire from an output handle to an input handle.',
      'Inspect and edit: Click any node to customize labels, file paths, tags, and runtime status in the right inspector.',
      'Starter Blueprints: Load pre-configured architectures from the Welcome screen or New Project dialog.',
    ],
  },
  {
    step: 3,
    title: 'AI Agent Telemetry & Single-Agent Floor',
    icon: Cpu,
    desc: 'Monitor Claude Code, Antigravity, OpenCode, and Codex agents running locally on your computer.',
    points: [
      'Zero Token Cost: Formative reads local log and transcript files directly from disk — 0 API tokens consumed.',
      'Real-time Flight: Switch to AI Flight to visualize active execution steps, tool calls, and model reasoning live.',
      'Operations Floor: The CEO agent leads from the corner office, coordinating tasks while modular skills activate on demand.',
      'Isolated Project State: Each project maintains its own office layout, active skills, and architecture configuration.',
    ],
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, theme }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const isDark = theme !== 'light';
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className={`w-full max-w-xl border rounded-lg shadow-2xl overflow-hidden flex flex-col ${
        isDark ? 'bg-[#252526] border-[#3e3e42] text-[#cccccc]' : 'bg-[#ffffff] border-[#e7e7e7] text-[#1e1e1e]'
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'bg-[#1e1e1e] border-[#3e3e42]' : 'bg-[#f3f3f3] border-[#e7e7e7]'
        }`}>
          <div className="flex items-center gap-3">
            <img 
              src="/assets/FormativeLogo.png" 
              alt="Formative" 
              className="w-5 h-5 object-contain rounded" 
            />
            <div>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                Formative Studio Guide
              </h3>
              <p className="text-xs text-[#858585]">
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#858585] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded border ${
              isDark 
                ? 'bg-[#1e1e1e] border-[#3e3e42] text-[#E04418]' 
                : 'bg-[#f3f3f3] border-[#e7e7e7] text-[#E04418]'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                {step.title}
              </h4>
              <p className="text-xs text-[#858585] mt-0.5 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded border space-y-2.5 ${
            isDark ? 'bg-[#1e1e1e] border-[#3e3e42]' : 'bg-[#f9f9f9] border-[#e7e7e7]'
          }`}>
            {step.points.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-[#E04418]/20 text-[#E04418] flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className={isDark ? 'text-[#cccccc]' : 'text-[#333333]'}>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${
          isDark ? 'bg-[#1e1e1e] border-[#3e3e42]' : 'bg-[#f3f3f3] border-[#e7e7e7]'
        }`}>
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
              currentStep === 0
                ? 'opacity-30 border-transparent text-[#858585] cursor-not-allowed'
                : isDark 
                  ? 'border-[#3e3e42] bg-[#252526] text-[#cccccc] hover:text-white' 
                  : 'border-[#e7e7e7] bg-white text-[#1e1e1e] hover:bg-[#e7e7e7]'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {tutorialSteps.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-4 bg-[#E04418]' : isDark ? 'bg-[#3e3e42]' : 'bg-[#ccc]'
                }`}
              />
            ))}
          </div>

          {currentStep < tutorialSteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(tutorialSteps.length - 1, prev + 1))}
              className="flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded bg-[#E04418] hover:bg-[#F25224] text-white shadow-xs transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded bg-[#E04418] hover:bg-[#F25224] text-white shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Get Started</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
