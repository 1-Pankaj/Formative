export type ArchitectureModuleKind = 'module' | 'route' | 'api' | 'schema' | 'test' | 'package';
export type ArchitectureRelationKind = 'imports' | 'calls-api' | 'uses-schema';
export type ArchitectureEvidenceLevel = 'observed' | 'inferred';

export interface ArchitectureMapModule {
  id: string;
  label: string;
  path: string;
  kind: ArchitectureModuleKind;
  evidenceLevel: ArchitectureEvidenceLevel;
  roleHint?: string;
  fileCount: number;
  languageCounts: Record<string, number>;
  filePaths: string[];
}

export interface ArchitectureMapConnection {
  id: string;
  source: string;
  target: string;
  relation: ArchitectureRelationKind;
  evidenceLevel: ArchitectureEvidenceLevel;
  count: number;
  evidencePaths: string[];
}

export interface ArchitectureMapSummary {
  scannedAt: string;
  scannedFileCount: number;
  parsedFileCount: number;
  moduleCount: number;
  connectionCount: number;
  languages: string[];
  frameworks: string[];
  parserErrorCount: number;
  truncated: boolean;
  limitations: string[];
}

export interface ArchitectureMap {
  modules: ArchitectureMapModule[];
  connections: ArchitectureMapConnection[];
  summary: ArchitectureMapSummary;
}

export interface ArchitectureSourceFile {
  path: string;
  content: string;
}

export interface ArchitectureSourceSummary {
  discoveredFiles: number;
  totalBytes: number;
  caseSensitivePaths: boolean;
  ignoredFiles: number;
  oversizedFiles: number;
  unreadableFiles: number;
  truncated: boolean;
  limitations: string[];
}
