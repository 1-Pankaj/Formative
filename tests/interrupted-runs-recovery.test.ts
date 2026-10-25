import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Interrupted Runs Self-Healing Simulation', () => {
  it('cleanly transitions in-flight runs to cancelled on crash recovery', () => {
    const now = new Date().toISOString();
    const staleRuns = [
      {
        id: 'run-1',
        status: 'running',
        prompt: 'Audit performance',
        events: [
          { id: 'ev-1', sequence: 1, type: 'progress', occurredAt: now, summary: 'Started' },
        ],
      },
      {
        id: 'run-2',
        status: 'completed', // Already done, should not be touched
        prompt: 'Check types',
        events: [
          { id: 'ev-2', sequence: 1, type: 'completed', occurredAt: now, summary: 'Done' },
        ],
      },
    ];

    const recovered = staleRuns.map((run) => {
      if (!['queued', 'starting', 'running', 'waiting_for_approval', 'stopping'].includes(run.status)) {
        return run;
      }
      const eventSequence = run.events.reduce((max, item) => Math.max(max, item.sequence), 0) + 1;
      const event = {
        id: `event-${crypto.randomUUID()}`,
        sequence: eventSequence,
        type: 'cancelled',
        occurredAt: now,
        summary: 'Run was interrupted before Formative recorded a final result.',
        details: 'Check the provider’s local session history before deciding whether to start it again.',
      };
      return {
        ...run,
        status: 'cancelled',
        updatedAt: now,
        finishedAt: now,
        events: [...run.events.slice(-79), event],
      };
    });

    // Run 1 should be cancelled with an added recovery event
    expect(recovered[0].status).toBe('cancelled');
    expect(recovered[0].events).toHaveLength(2);
    expect(recovered[0].events[1].sequence).toBe(2);
    expect(recovered[0].events[1].type).toBe('cancelled');

    // Run 2 should remain unchanged
    expect(recovered[1].status).toBe('completed');
    expect(recovered[1].events).toHaveLength(1);
  });
});
