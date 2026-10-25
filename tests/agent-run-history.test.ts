import { describe, it, expect } from 'vitest';
// @ts-ignore
import { normalizeAgentHistory } from '../electron/agent-run-history.cjs';

describe('normalizeAgentHistory', () => {
  const validConversation = {
    id: 'conv-1',
    providerId: 'codex-cli',
    title: 'Analyze database performance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('normalizes valid conversations and empty runs', () => {
    const result = normalizeAgentHistory([validConversation], []);
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].id).toBe('conv-1');
    expect(result.conversations[0].providerId).toBe('codex-cli');
    expect(result.runs).toHaveLength(0);
  });

  it('enforces monotonic sequence numbering on run events', () => {
    const now = new Date().toISOString();
    const validRun = {
      id: 'run-1',
      conversationId: 'conv-1',
      providerId: 'codex-cli',
      prompt: 'Check indexes',
      permissionMode: 'read-only',
      status: 'completed',
      createdAt: now,
      updatedAt: now,
      events: [
        { id: 'ev-1', sequence: 1, type: 'progress', occurredAt: now, summary: 'Step 1' },
        { id: 'ev-2', sequence: 2, type: 'progress', occurredAt: now, summary: 'Step 2' },
      ],
    };

    const result = normalizeAgentHistory([validConversation], [validRun]);
    expect(result.runs[0].events).toHaveLength(2);

    // Non-increasing sequence must throw
    const invalidRun = {
      ...validRun,
      events: [
        { id: 'ev-1', sequence: 2, type: 'progress', occurredAt: now, summary: 'Step 1' },
        { id: 'ev-2', sequence: 1, type: 'progress', occurredAt: now, summary: 'Step 2' },
      ],
    };

    expect(() => normalizeAgentHistory([validConversation], [invalidRun])).toThrow(
      'Agent progress events must have strictly increasing sequence numbers.'
    );
  });

  it('rejects path traversal and absolute paths in relativePaths', () => {
    const now = new Date().toISOString();
    const traversalRun = {
      id: 'run-traversal',
      conversationId: 'conv-1',
      providerId: 'codex-cli',
      prompt: 'Test',
      permissionMode: 'read-only',
      status: 'completed',
      createdAt: now,
      updatedAt: now,
      events: [
        {
          id: 'ev-1',
          sequence: 1,
          type: 'file_changed',
          occurredAt: now,
          summary: 'Changed file',
          relativePaths: ['../../etc/passwd'],
        },
      ],
    };

    expect(() => normalizeAgentHistory([validConversation], [traversalRun])).toThrow(
      'Agent event paths cannot escape the selected project.'
    );

    const absoluteRun = {
      ...traversalRun,
      events: [
        {
          id: 'ev-2',
          sequence: 1,
          type: 'file_changed',
          occurredAt: now,
          summary: 'Changed file',
          relativePaths: ['C:\\Windows\\System32\\cmd.exe'],
        },
      ],
    };

    expect(() => normalizeAgentHistory([validConversation], [absoluteRun])).toThrow(
      'Agent event paths must be project-relative paths.'
    );
  });

  it('rejects runs without matching conversation', () => {
    const now = new Date().toISOString();
    const orphanedRun = {
      id: 'run-orphan',
      conversationId: 'conv-unknown',
      providerId: 'codex-cli',
      prompt: 'Test',
      permissionMode: 'read-only',
      status: 'completed',
      createdAt: now,
      updatedAt: now,
      events: [],
    };

    expect(() => normalizeAgentHistory([validConversation], [orphanedRun])).toThrow(
      'Every agent run must belong to a saved conversation in this project.'
    );
  });
});
