// Office banter and quip lines for single-agent office floor.
// Provides both idle watercooler/coffee talk and active tool action quips.

export type ToolCategory = 'read' | 'write' | 'command' | 'think' | 'done' | 'idle';

export const TOOL_QUIPS: Record<ToolCategory, string[]> = {
  read: [
    "Analyzing codebase architecture...",
    "Scanning AST and symbols...",
    "Reviewing specs and interfaces...",
    "Checking dependencies...",
    "Reading file tree...",
    "Checking configuration..."
  ],
  write: [
    "Drafting implementation...",
    "Writing clean component code...",
    "Refactoring modules...",
    "Updating styles and responsive UI...",
    "Applying surgical edits...",
    "Saving changes to disk..."
  ],
  command: [
    "Running test suite in terminal...",
    "Building bundle...",
    "Validating type checks...",
    "Executing verification script...",
    "Checking build outputs...",
    "Linting source files..."
  ],
  think: [
    "Formulating optimal design pattern...",
    "Evaluating edge cases...",
    "Checking performance impact...",
    "Synthesizing requirements...",
    "Planning next execution steps..."
  ],
  done: [
    "Task completed successfully!",
    "Changes deployed and verified.",
    "Ready for next instructions.",
    "Clean build, no regressions!"
  ],
  idle: [
    "Standing by for next task...",
    "Monitoring workspace...",
    "Reviewing open tickets...",
    "Coffee break time."
  ]
};

export const BREAK_LINES = [
  "is this... decaf?? who brewed this",
  "first cup of the day. and the fourth.",
  "who finished the coffee beans again?",
  "checking the latest pull request...",
  "the test suite passed on first run!",
  "water cooler talks hit different at 2am",
  "clean architecture, happy team.",
  "just checking system metrics on the dashboard",
  "refactoring this metatable is so satisfying"
];

export function getToolCategory(toolName?: string): ToolCategory {
  if (!toolName) return 'idle';
  const lower = toolName.toLowerCase();
  if (lower.includes('read') || lower.includes('search') || lower.includes('inspect') || lower.includes('get_')) {
    return 'read';
  }
  if (lower.includes('write') || lower.includes('edit') || lower.includes('patch') || lower.includes('create')) {
    return 'write';
  }
  if (lower.includes('command') || lower.includes('run') || lower.includes('exec') || lower.includes('test') || lower.includes('build')) {
    return 'command';
  }
  return 'think';
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
