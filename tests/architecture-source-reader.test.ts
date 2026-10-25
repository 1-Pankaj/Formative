import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
// @ts-ignore
import { readArchitectureSources } from '../electron/architecture-source-reader.cjs';

describe('readArchitectureSources', () => {
  it('excludes secret files, node_modules, and git directories', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'formative-test-'));

    try {
      // Create source files
      fs.writeFileSync(path.join(tempDir, 'index.ts'), 'export const hello = "world";');
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.writeFileSync(path.join(tempDir, 'src', 'app.py'), 'print("hi")');

      // Create secrets that MUST be ignored
      fs.writeFileSync(path.join(tempDir, '.env'), 'SECRET_API_KEY=12345');
      fs.writeFileSync(path.join(tempDir, 'credentials.json'), '{"password":"123"}');
      fs.writeFileSync(path.join(tempDir, 'id_rsa'), 'PRIVATE KEY');

      // Create ignored directories
      fs.mkdirSync(path.join(tempDir, 'node_modules'));
      fs.writeFileSync(path.join(tempDir, 'node_modules', 'dep.js'), 'module.exports = {};');
      fs.mkdirSync(path.join(tempDir, '.git'));
      fs.writeFileSync(path.join(tempDir, '.git', 'config'), 'repo config');

      const result = await readArchitectureSources(tempDir);
      expect(result.success).toBe(true);

      const paths = result.sources.map((s: { path: string }) => s.path);

      // Verify legitimate files are captured
      expect(paths).toContain('index.ts');
      expect(paths).toContain('src/app.py');

      // Verify secret and ignored files are NEVER captured
      expect(paths).not.toContain('.env');
      expect(paths).not.toContain('credentials.json');
      expect(paths).not.toContain('id_rsa');
      expect(paths).not.toContain('node_modules/dep.js');
      expect(paths).not.toContain('.git/config');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('respects .gitignore ignore rules', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'formative-gitignore-test-'));

    try {
      fs.writeFileSync(path.join(tempDir, '.gitignore'), 'temp_folder/\n*.secret.ts');
      fs.mkdirSync(path.join(tempDir, 'temp_folder'));
      fs.writeFileSync(path.join(tempDir, 'temp_folder', 'file.ts'), 'export const a = 1;');
      fs.writeFileSync(path.join(tempDir, 'config.secret.ts'), 'export const key = 2;');
      fs.writeFileSync(path.join(tempDir, 'main.ts'), 'export const main = 3;');

      const result = await readArchitectureSources(tempDir);
      const paths = result.sources.map((s: { path: string }) => s.path);

      expect(paths).toContain('main.ts');
      expect(paths).not.toContain('temp_folder/file.ts');
      expect(paths).not.toContain('config.secret.ts');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
