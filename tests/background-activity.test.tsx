import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AgentRunDock } from '../src/components/chat/AgentRunDock';
import type { Project } from '../src/types';

describe('background activity monitor', () => {
  it('shows a persistent local model activity card without offering a fake stop action', () => {
    const markup = renderToStaticMarkup(
      <AgentRunDock
        runs={[]}
        localActivity={{
          projectId: 'project-1',
          projectName: 'Sample project',
          employeeName: 'Elena',
          startedAt: '2026-10-26T12:00:00.000Z',
        }}
        theme="dark"
        onOpenRun={() => {}}
        onStopRun={async () => {}}
      />,
    );

    expect(markup).toContain('Background work in progress');
    expect(markup).toContain('Local AI · on this device');
    expect(markup).toContain('Elena · Sample project');
    expect(markup).toContain('Your message stays local.');
    expect(markup).not.toContain('Stop Run');
  });

  it('keeps an agent run visible with its owning project', () => {
    const project: Project = {
      id: 'project-1',
      name: 'Other project',
      description: '',
      type: 'general',
      updatedAt: '2026-10-26T12:00:00.000Z',
      nodes: [],
      edges: [],
    };
    const markup = renderToStaticMarkup(
      <AgentRunDock
        runs={[{
          project,
          run: {
            id: 'run-1',
            conversationId: 'conversation-1',
            providerId: 'codex-cli',
            prompt: 'Inspect the project',
            permissionMode: 'read-only',
            status: 'running',
            createdAt: '2026-10-26T12:00:00.000Z',
            updatedAt: '2026-10-26T12:00:00.000Z',
            events: [],
          },
        }]}
        theme="dark"
        onOpenRun={() => {}}
        onStopRun={async () => {}}
      />,
    );

    expect(markup).toContain('Background agent execution monitor');
    expect(markup).toContain('Other project');
    expect(markup).toContain('Inspect the project');
    expect(markup).toContain('Stop Run');
  });
});
