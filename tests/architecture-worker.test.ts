import { describe, it, expect } from 'vitest';
import { buildArchitectureMap, type WorkerInput } from '../src/workers/architectureMap.worker';

describe('buildArchitectureMap (Worker Engine)', () => {
  it('parses TypeScript files, imports, and framework routes', () => {
    const input: WorkerInput = {
      caseSensitivePaths: false,
      sourceSummary: {
        discoveredFiles: 3,
        totalBytes: 1024,
        caseSensitivePaths: false,
        ignoredFiles: 0,
        oversizedFiles: 0,
        unreadableFiles: 0,
        truncated: false,
        limitations: [],
      },
      sources: [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'sample-project',
            dependencies: {
              react: '^19.0.0',
              next: '^15.0.0',
            },
          }),
        },
        {
          path: 'src/app/api/users/route.ts',
          content: `
            import { NextResponse } from 'next/server';
            import { getUserService } from '@/services/userService';

            export async function GET() {
              const users = getUserService();
              return NextResponse.json(users);
            }
          `,
        },
        {
          path: 'src/services/userService.ts',
          content: `
            export function getUserService() {
              return [{ id: 1, name: 'Alice' }];
            }
          `,
        },
      ],
    };

    const map = buildArchitectureMap(input);

    expect(map.summary.frameworks).toContain('Next.js');
    expect(map.summary.languages).toContain('TypeScript');
    expect(map.modules.length).toBeGreaterThan(0);

    // Route should be identified
    const routeModule = map.modules.find((m) => m.kind === 'route' || m.label.includes('users'));
    expect(routeModule).toBeDefined();

    // Connection from route to userService or package should exist
    expect(map.connections.length).toBeGreaterThan(0);
  });

  it('detects schema files like Prisma models', () => {
    const input: WorkerInput = {
      caseSensitivePaths: false,
      sourceSummary: {
        discoveredFiles: 1,
        totalBytes: 500,
        caseSensitivePaths: false,
        ignoredFiles: 0,
        oversizedFiles: 0,
        unreadableFiles: 0,
        truncated: false,
        limitations: [],
      },
      sources: [
        {
          path: 'prisma/schema.prisma',
          content: `
            datasource db {
              provider = "postgresql"
              url      = env("DATABASE_URL")
            }

            model User {
              id    Int     @id @default(autoincrement())
              email String  @unique
              name  String?
            }
          `,
        },
      ],
    };

    const map = buildArchitectureMap(input);
    const schemaModule = map.modules.find((m) => m.kind === 'schema');
    expect(schemaModule).toBeDefined();
    expect(schemaModule?.label).toBe('schema.prisma');
  });

  it('gracefully handles syntax errors in source files without crashing', () => {
    const input: WorkerInput = {
      caseSensitivePaths: false,
      sourceSummary: {
        discoveredFiles: 1,
        totalBytes: 100,
        caseSensitivePaths: false,
        ignoredFiles: 0,
        oversizedFiles: 0,
        unreadableFiles: 0,
        truncated: false,
        limitations: [],
      },
      sources: [
        {
          path: 'src/broken.ts',
          content: 'export const broken = {{{',
        },
      ],
    };

    const map = buildArchitectureMap(input);
    expect(map.summary.parserErrorCount).toBe(1);
    expect(map.modules.length).toBeGreaterThan(0);
  });
});
