import { describe, it, expect } from 'vitest';
import { cleanPromptForDisplay, getConversationCleanTitle } from '../src/utils/promptUtils';

describe('Prompt Display Utilities', () => {
  it('extracts clean user question from coordinator prompt with task context', () => {
    const raw = `You are the project coordinator for GreenEnergyApp. Answer using the current project task records and read-only project files when useful. Be clear about missing or stale information. Do not claim that an agent is working unless Formative shows a real active run.

Open project tasks (1):
- TASK-1: make readme.md file [todo]

User's question: hello`;

    expect(cleanPromptForDisplay(raw)).toBe('hello');
    expect(getConversationCleanTitle(raw)).toBe('hello');
  });

  it('preserves normal user questions untouched', () => {
    const normal = 'How do I run tests in this app?';
    expect(cleanPromptForDisplay(normal)).toBe('How do I run tests in this app?');
    expect(getConversationCleanTitle(normal)).toBe('How do I run tests in this app?');
  });

  it('truncates long titles cleanly', () => {
    const long = 'a'.repeat(100);
    const title = getConversationCleanTitle(long, 50);
    expect(title.length).toBe(50);
    expect(title.endsWith('…')).toBe(true);
  });
});
