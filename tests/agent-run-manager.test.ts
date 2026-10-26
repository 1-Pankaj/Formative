import { describe, it, expect } from 'vitest';
// @ts-ignore
import {
  findExecutable,
  isWindowsBatch,
  clampText,
  relativeProjectPaths,
  createAgentRunManager,
} from '../electron/agent-run-manager.cjs';

describe('Agent Run Manager Utilities', () => {
  it('detects Windows batch files accurately', () => {
    if (process.platform === 'win32') {
      expect(isWindowsBatch('C:\\path\\to\\codex.cmd')).toBe(true);
      expect(isWindowsBatch('C:\\path\\to\\codex.bat')).toBe(true);
      expect(isWindowsBatch('C:\\path\\to\\codex.exe')).toBe(false);
      expect(isWindowsBatch('C:\\path\\to\\codex')).toBe(false);
    }
  });

  it('clamps text and removes null characters', () => {
    expect(clampText('hello\u0000world')).toBe('helloworld');
    const longText = 'a'.repeat(5000);
    const clamped = clampText(longText, 100);
    expect(clamped.length).toBe(100);
    expect(clamped.endsWith('…')).toBe(true);
  });

  it('filters candidates to project-relative paths and rejects escapes', () => {
    const projectPath = 'C:\\projects\\my-app';
    const candidates = [
      'src\\index.ts',
      'C:\\projects\\my-app\\src\\utils.ts',
      '..\\..\\secret.txt',
      'D:\\other-drive\\file.ts',
      '',
    ];

    const result = relativeProjectPaths(projectPath, candidates);
    expect(result).toContain('src\\index.ts');
    expect(result).toContain('src\\utils.ts');
    expect(result).not.toContain('..\\..\\secret.txt');
    expect(result).not.toContain('D:\\other-drive\\file.ts');
  });

  it('finds executable binaries on PATH', () => {
    if (process.platform === 'win32') {
      // cmd or node is guaranteed to be on PATH on any Windows machine/runner
      const nodePath = findExecutable('node');
      expect(nodePath).toBeDefined();
      expect(typeof nodePath).toBe('string');

      // Returns null for non-existent binaries
      const nonExistent = findExecutable('non_existent_binary_xyz_123');
      expect(nonExistent).toBeNull();

      // If codex is installed, it returns a string path
      const codexPath = findExecutable('codex');
      if (codexPath) {
        expect(typeof codexPath).toBe('string');
      }
    }
  });

  it('returns valid provider statuses through getStatuses()', async () => {
    const emittedEvents: any[] = [];
    const manager = createAgentRunManager({
      emitEvent: (e: any) => emittedEvents.push(e),
    });

    const statuses = await manager.getStatuses();
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses.length).toBeGreaterThan(0);

    const codexStatus = statuses.find((s: any) => s.providerId === 'codex-cli');
    expect(codexStatus).toBeDefined();
    expect(codexStatus.displayName).toBe('Codex');
    expect(['installed', 'missing', 'unsupported']).toContain(codexStatus.state);

    if (codexStatus.state === 'installed') {
      expect(codexStatus.version).toBeDefined();
      expect(codexStatus.capabilities.canStartRun).toBe(true);
    } else {
      expect(codexStatus.capabilities.canStartRun).toBe(false);
      expect(codexStatus.explanation).toContain('Install');
    }
  });
});
