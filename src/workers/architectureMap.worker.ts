import { parse } from '@babel/parser';
import type {
  ArchitectureEvidenceLevel,
  ArchitectureMap,
  ArchitectureMapConnection,
  ArchitectureMapModule,
  ArchitectureModuleKind,
  ArchitectureSourceFile,
  ArchitectureSourceSummary,
} from '../types/architectureMap';

export interface WorkerInput {
  sources: ArchitectureSourceFile[];
  sourceSummary: ArchitectureSourceSummary;
  caseSensitivePaths: boolean;
}

interface PackageInfo {
  root: string;
  name?: string;
  dependencies: Set<string>;
}

interface FileInfo {
  path: string;
  content: string;
  extension: string;
  language: string;
  kind: ArchitectureModuleKind;
  evidenceLevel: ArchitectureEvidenceLevel;
  roleHint?: string;
  moduleId: string;
  imports: string[];
  apiCalls: string[];
  apiRoutes: string[];
}

const CODE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts', '.py', '.pyi', '.go', '.rs', '.java', '.cs', '.php', '.rb', '.vue', '.svelte', '.astro']);
const PARSER_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts']);
const MAX_MODULES = 240;
const MAX_CONNECTIONS = 1200;
const MAX_FILES_PER_MODULE = 120;
const MAX_EVIDENCE_PATHS = 12;

const FRAMEWORK_PACKAGES: Array<[string, string]> = [
  ['next', 'Next.js'], ['react', 'React'], ['vite', 'Vite'], ['vue', 'Vue'], ['nuxt', 'Nuxt'],
  ['svelte', 'Svelte'], ['@sveltejs/kit', 'SvelteKit'], ['@remix-run/react', 'Remix'],
  ['@remix-run/node', 'Remix'], ['astro', 'Astro'], ['express', 'Express'], ['fastify', 'Fastify'],
  ['@nestjs/core', 'NestJS'], ['hono', 'Hono'], ['prisma', 'Prisma'], ['@prisma/client', 'Prisma'],
  ['drizzle-orm', 'Drizzle'], ['typeorm', 'TypeORM'], ['sequelize', 'Sequelize'], ['mongoose', 'Mongoose'],
];

const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'crypto', 'dgram', 'diagnostics_channel',
  'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https', 'module', 'net', 'os', 'path',
  'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder',
  'sys', 'timers', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
]);

const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, '');
const basename = (value: string) => normalizePath(value).split('/').pop() || value;
const extensionOf = (value: string) => {
  const name = basename(value).toLowerCase();
  if (name.endsWith('.d.ts')) return '.ts';
  return name.includes('.') ? `.${name.split('.').pop()}` : '';
};

function stableId(prefix: string, value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`;
}

function getLanguage(extension: string): string {
  if (['.js', '.jsx', '.mjs', '.cjs'].includes(extension)) return 'JavaScript';
  if (['.ts', '.tsx', '.mts', '.cts'].includes(extension)) return 'TypeScript';
  if (['.py', '.pyi'].includes(extension)) return 'Python';
  if (extension === '.go') return 'Go';
  if (extension === '.rs') return 'Rust';
  if (extension === '.java') return 'Java';
  if (extension === '.cs') return 'C#';
  if (extension === '.php') return 'PHP';
  if (extension === '.rb') return 'Ruby';
  if (extension === '.vue') return 'Vue';
  if (extension === '.svelte') return 'Svelte';
  if (extension === '.astro') return 'Astro';
  return 'Other';
}

function getPackageName(specifier: string): string | null {
  if (!specifier || specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('#') || specifier.startsWith('node:')) return null;
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function getStaticString(node: any): string | null {
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'StringLiteral' || node.type === 'Literal') return typeof node.value === 'string' ? node.value : null;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0]?.value?.cooked ?? null;
  return null;
}

function getScriptBodies(file: ArchitectureSourceFile, extension: string): Array<{ source: string; isTypeScript: boolean }> {
  if (!['.vue', '.svelte', '.astro'].includes(extension)) {
    return [{ source: file.content, isTypeScript: ['.ts', '.tsx', '.mts', '.cts'].includes(extension) }];
  }
  const scripts: Array<{ source: string; isTypeScript: boolean }> = [];
  const expression = /<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi;
  for (const match of file.content.matchAll(expression)) {
    const openingTag = match[0].slice(0, match[0].indexOf('>') + 1);
    scripts.push({
      source: match[1],
      isTypeScript: /\blang\s*=\s*["'](?:ts|typescript)["']/i.test(openingTag),
    });
  }
  return scripts;
}

function parseJavascriptFile(file: ArchitectureSourceFile, extension: string): { imports: string[]; apiCalls: string[]; apiRoutes: string[]; error: boolean } {
  const imports = new Set<string>();
  const apiCalls = new Set<string>();
  const apiRoutes = new Set<string>();
  const scripts = getScriptBodies(file, extension);
  if (!scripts.length) return { imports: [], apiCalls: [], apiRoutes: [], error: false };
  let error = false;

  for (const script of scripts) {
    let ast: any;
    try {
      ast = parse(script.source, {
        sourceType: 'unambiguous',
        errorRecovery: true,
        allowAwaitOutsideFunction: true,
        plugins: script.isTypeScript
          ? ['typescript', 'jsx', 'decorators-legacy', 'importAttributes', 'explicitResourceManagement']
          : ['jsx', 'flow', 'flowComments', 'decorators-legacy', 'importAttributes', 'explicitResourceManagement'],
      });
      if (ast.errors?.length) error = true;
    } catch {
      error = true;
      continue;
    }

    const visit = (node: any): void => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        for (const child of node) visit(child);
        return;
      }

      if (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') {
        const value = getStaticString(node.source);
        if (value) imports.add(value);
      } else if (node.type === 'TSImportType') {
        const value = getStaticString(node.argument);
        if (value) imports.add(value);
      } else if (node.type === 'CallExpression' || node.type === 'OptionalCallExpression') {
        const callee = node.callee;
        const argument = getStaticString(node.arguments?.[0]?.type === 'SpreadElement' ? null : node.arguments?.[0]);
        if (argument && callee?.type === 'Import') imports.add(argument);
        if (argument && callee?.type === 'Identifier' && callee.name === 'require') imports.add(argument);

        const method = callee?.type === 'MemberExpression' && !callee.computed ? callee.property?.name : null;
        const routeOwner = callee?.type === 'MemberExpression' && callee.object?.type === 'Identifier' ? callee.object.name : '';
        if (argument?.startsWith('/') && ['get', 'post', 'put', 'patch', 'delete', 'all'].includes(method) &&
          ['app', 'router', 'server', 'fastify', 'api'].includes(routeOwner)) {
          apiRoutes.add(`${String(method).toUpperCase()} ${argument.replace(/\/$/, '') || '/'}`);
        }

        if (argument && argument.startsWith('/')) {
          const isFetch = callee?.type === 'Identifier' && callee.name === 'fetch';
          const isHttpClient = callee?.type === 'MemberExpression' &&
            ['get', 'post', 'put', 'patch', 'delete', 'request'].includes(callee.property?.name) &&
            ['axios', 'client', 'api', 'http'].includes(callee.object?.name);
          if (isFetch || isHttpClient) apiCalls.add(argument.replace(/\/$/, '') || '/');
        }
      }

      for (const [key, value] of Object.entries(node)) {
        if (key === 'loc' || key === 'start' || key === 'end' || key === 'extra' || key === 'comments' || key === 'tokens' || key === 'errors') continue;
        if (Array.isArray(value) || (value && typeof value === 'object')) visit(value);
      }
    };

    visit(ast.program);
  }

  return { imports: [...imports], apiCalls: [...apiCalls], apiRoutes: [...apiRoutes], error };
}

function resolveCandidates(basePath: string, extension: string): string[] {
  const cleanBase = normalizeRelativePath(basePath).replace(/\/$/, '');
  const extensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte', '.astro', '.py', '.pyi', '.go', '.rs', '.java', '.cs', '.rb', '.json'];
  if (extension) {
    const sourceExtension = extension.toLowerCase();
    const alternate = sourceExtension === '.js' ? ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
      : sourceExtension === '.jsx' ? ['.tsx', '.jsx', '.js']
        : sourceExtension === '.mjs' ? ['.mts', '.mjs', '.js']
          : sourceExtension === '.cjs' ? ['.cts', '.cjs', '.js']
            : sourceExtension === '.ts' ? ['.ts', '.tsx', '.mts', '.cts']
              : [sourceExtension];
    return [cleanBase, ...alternate.map((ext) => `${cleanBase.slice(0, -sourceExtension.length)}${ext}`)];
  }
  return [cleanBase, ...extensions.map((ext) => `${cleanBase}${ext}`), ...extensions.map((ext) => `${cleanBase}/index${ext}`)];
}

function normalizeRelativePath(value: string): string {
  const parts: string[] = [];
  for (const part of normalizePath(value).split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
}

function pathIsWithin(child: string, parent: string): boolean {
  const normalizedChild = normalizePath(child);
  const normalizedParent = normalizePath(parent);
  return normalizedParent === '' || normalizedChild === normalizedParent || normalizedChild.startsWith(`${normalizedParent}/`);
}

function modulePathForFile(filePath: string, packageRoots: PackageInfo[]): string {
  const containingPackages = packageRoots
    .filter((info) => info.root && pathIsWithin(filePath, info.root))
    .sort((left, right) => right.root.length - left.root.length);
  const packageRoot = containingPackages.find((info) => info.root !== '')?.root || '';
  const relative = packageRoot ? filePath.slice(packageRoot.length).replace(/^\//, '') : filePath;
  const segments = relative.split('/').filter(Boolean);
  if (segments.length === 0) return packageRoot || 'root';

  const commonBoundaries = new Set(['src', 'app', 'pages', 'lib', 'server', 'client', 'tests', 'test', 'packages', 'apps']);
  let moduleParts: string[];
  if (commonBoundaries.has(segments[0].toLowerCase())) {
    moduleParts = segments.length > 1 ? segments.slice(0, 2) : segments.slice(0, 1);
  } else {
    moduleParts = segments.slice(0, 1);
  }
  const childPath = moduleParts.join('/');
  return normalizePath(packageRoot ? `${packageRoot}/${childPath}` : childPath) || 'root';
}

function routeInfoForPath(filePath: string, frameworks: Set<string>): { path: string; kind: 'route' | 'api'; level: ArchitectureEvidenceLevel; hint: string } | null {
  const normalized = normalizePath(filePath);
  const segments = normalized.split('/');
  const name = basename(normalized);
  const extension = extensionOf(normalized);
  if (!CODE_EXTENSIONS.has(extension)) return null;

  const hasFramework = (...values: string[]) => values.some((value) => frameworks.has(value));
  const routeSegmentIndex = hasFramework('Remix', 'SvelteKit')
    ? segments.findIndex((segment) => segment.toLowerCase() === 'routes')
    : hasFramework('Next.js')
      ? segments.findIndex((segment) => ['app', 'pages'].includes(segment.toLowerCase()))
      : hasFramework('Nuxt', 'Astro')
        ? segments.findIndex((segment) => segment.toLowerCase() === 'pages')
        : -1;
  if (routeSegmentIndex < 0) return null;
  const routeRoot = segments[routeSegmentIndex].toLowerCase();
  const routeParts = segments.slice(routeSegmentIndex + 1);
  const lowerName = name.toLowerCase();
  let urlParts: string[] | null = null;
  let kind: 'route' | 'api' = 'route';
  let hint = '';

  if (hasFramework('Next.js') && (routeRoot === 'app' || routeRoot === 'pages')) {
    if (routeRoot === 'app' && ['page', 'route'].includes(lowerName.replace(/\.[^.]+$/, ''))) {
      if (lowerName.startsWith('route.')) kind = 'api';
      urlParts = routeParts.slice(0, -1).filter((part) => !/^\([^/]+\)$/.test(part));
      hint = kind === 'api' ? 'Next.js route handler convention' : 'Next.js page route convention';
    } else if (routeRoot === 'pages' && /\.(?:[cm]?[jt]sx?|vue|svelte)$/.test(lowerName) && !/^_(?:app|document|error)\./.test(lowerName)) {
      kind = routeParts[0]?.toLowerCase() === 'api' ? 'api' : 'route';
      urlParts = routeParts;
      urlParts[urlParts.length - 1] = urlParts[urlParts.length - 1].replace(/\.(?:[cm]?[jt]sx?|vue|svelte)$/i, '');
      if (urlParts[urlParts.length - 1]?.toLowerCase() === 'index') urlParts.pop();
      hint = kind === 'api' ? 'Next.js API route convention' : 'Next.js page route convention';
    }
  } else if (routeRoot === 'routes' && hasFramework('SvelteKit') && /^\+(?:page|server)\./i.test(lowerName)) {
    kind = lowerName.startsWith('+server.') ? 'api' : 'route';
    urlParts = routeParts.slice(0, -1).filter((part) => !/^\([^/]+\)$/.test(part));
    hint = kind === 'api' ? 'SvelteKit server route convention' : 'SvelteKit page route convention';
  } else if (routeRoot === 'pages' && hasFramework('Nuxt') && /\.(?:vue|[cm]?[jt]sx?)$/i.test(lowerName)) {
    urlParts = routeParts;
    urlParts[urlParts.length - 1] = urlParts[urlParts.length - 1].replace(/\.(?:vue|[cm]?[jt]sx?)$/i, '');
    if (urlParts[urlParts.length - 1]?.toLowerCase() === 'index') urlParts.pop();
    hint = 'Nuxt page route convention';
  } else if (routeRoot === 'pages' && hasFramework('Astro') && /\.astro$/i.test(lowerName)) {
    urlParts = routeParts;
    urlParts[urlParts.length - 1] = urlParts[urlParts.length - 1].replace(/\.astro$/i, '');
    if (urlParts[urlParts.length - 1]?.toLowerCase() === 'index') urlParts.pop();
    hint = 'Astro page route convention';
  } else if (routeRoot === 'routes' && hasFramework('Remix') && /\.(?:[cm]?[jt]sx?)$/i.test(lowerName)) {
    const routeName = routeParts[routeParts.length - 1].replace(/\.(?:[cm]?[jt]sx?)$/i, '');
    urlParts = [...routeParts.slice(0, -1), ...routeName.split('.')];
    hint = 'Remix route filename convention';
  }

  if (!urlParts) return null;
  const normalizedParts = urlParts
    .filter((part) => hasFramework('Remix') ? part !== '_index' && !part.startsWith('_') : !/^\([^/]+\)$/.test(part))
    .map((part) => part
    .replace(/^\[\.\.\.(.+)\]$/, '*$1')
    .replace(/^\[(.+)\]$/, ':$1')
    .replace(/^\$$/, '*')
    .replace(/^\$(.+)$/, ':$1'))
    .filter(Boolean);
  const routePath = `/${normalizedParts.join('/')}`.replace(/\/+/g, '/');

  const hasKnownFramework = Boolean(hint);
  return {
    path: routePath === '' ? '/' : routePath,
    kind,
    level: hasKnownFramework ? 'inferred' : 'inferred',
    hint,
  };
}

function classifySchema(filePath: string): { label: string; hint: string } | null {
  const normalized = normalizePath(filePath).toLowerCase();
  const name = basename(normalized);
  const extension = extensionOf(normalized);
  if (extension === '.prisma') return { label: name, hint: 'Prisma schema file' };
  if (['.graphql', '.gql'].includes(extension) && /schema|type|api/.test(name)) return { label: name, hint: 'GraphQL schema file' };
  if (extension === '.proto') return { label: name, hint: 'Protocol Buffers schema file' };
  if (extension === '.sql' && /(?:^|\/)(?:schema|migrations?)(?:\/|$)/.test(normalized)) return { label: name, hint: 'SQL schema or migration file' };
  if (['.yaml', '.yml', '.json'].includes(extension) && /(?:openapi|swagger|schema)/.test(name)) return { label: name, hint: 'API or data schema file' };
  return null;
}

function getModuleDisplayName(modulePath: string): string {
  if (modulePath === 'root') return 'Project root';
  return basename(modulePath) || modulePath;
}

function routePathMatches(routePath: string, requestedPath: string): boolean {
  const pattern = routePath.split('/').map((segment) => {
    if (segment.startsWith(':')) return '[^/]+';
    if (segment.startsWith('*')) return '.+';
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('/');
  try { return new RegExp(`^${pattern}/?$`).test(requestedPath); } catch { return false; }
}

function parseTypeScriptAliases(sources: ArchitectureSourceFile[]): Array<{ base: string; pattern: string; targets: string[] }> {
  const aliases: Array<{ base: string; pattern: string; targets: string[] }> = [];
  for (const source of sources) {
    const name = basename(source.path).toLowerCase();
    if (name !== 'tsconfig.json' && name !== 'jsconfig.json') continue;
    try {
      const config = JSON.parse(source.content);
      const compilerOptions = config?.compilerOptions || {};
      const configDir = normalizePath(source.path).split('/').slice(0, -1).join('/');
      const base = normalizePath(configDir && compilerOptions.baseUrl
        ? `${configDir}/${compilerOptions.baseUrl}`
        : compilerOptions.baseUrl || configDir);
      for (const [pattern, targets] of Object.entries(compilerOptions.paths || {})) {
        if (!Array.isArray(targets)) continue;
        aliases.push({ base, pattern, targets: targets.filter((target): target is string => typeof target === 'string') });
      }
    } catch {
      // Invalid project configuration is reported by the parser only when source code is affected.
    }
  }
  return aliases;
}

export function buildArchitectureMap(input: WorkerInput): ArchitectureMap {
  const sources = input.sources.map((source) => ({ ...source, path: normalizePath(source.path) }));
  const fileByPath = new Map<string, ArchitectureSourceFile>();
  const lowerPathIndex = new Map<string, string>();
  for (const source of sources) {
    fileByPath.set(source.path, source);
    lowerPathIndex.set(source.path.toLowerCase(), source.path);
  }
  const canonicalPath = (candidate: string): string | null => {
    const clean = normalizePath(candidate);
    if (fileByPath.has(clean)) return clean;
    return input.caseSensitivePaths ? null : lowerPathIndex.get(clean.toLowerCase()) || null;
  };

  const packageInfos: PackageInfo[] = [];
  const frameworks = new Set<string>();
  const allDeclaredDependencies = new Set<string>();
  for (const source of sources) {
    if (basename(source.path).toLowerCase() !== 'package.json') continue;
    try {
      const manifest = JSON.parse(source.content);
      const packageRoot = normalizePath(source.path).split('/').slice(0, -1).join('/');
      const dependencyNames = [
        ...Object.keys(manifest.dependencies || {}),
        ...Object.keys(manifest.devDependencies || {}),
        ...Object.keys(manifest.peerDependencies || {}),
        ...Object.keys(manifest.optionalDependencies || {}),
      ];
      const dependencySet = new Set(dependencyNames);
      for (const dependency of dependencyNames) {
        allDeclaredDependencies.add(dependency);
        const foundFramework = FRAMEWORK_PACKAGES.find(([packageName]) => packageName === dependency);
        if (foundFramework) frameworks.add(foundFramework[1]);
      }
      packageInfos.push({ root: packageRoot, name: typeof manifest.name === 'string' ? manifest.name : undefined, dependencies: dependencySet });
    } catch {
      // A broken manifest does not stop source relationship analysis.
    }
  }
  if (sources.some((source) => /(?:^|\/)next\.config\./i.test(source.path))) frameworks.add('Next.js');

  const frameworksForPath = (filePath: string): Set<string> => {
    const nearestPackage = packageInfos
      .filter((info) => pathIsWithin(filePath, info.root))
      .sort((left, right) => right.root.length - left.root.length)[0];
    if (!nearestPackage) return frameworks;
    const localFrameworks = new Set<string>();
    for (const dependency of nearestPackage.dependencies) {
      const foundFramework = FRAMEWORK_PACKAGES.find(([packageName]) => packageName === dependency);
      if (foundFramework) localFrameworks.add(foundFramework[1]);
    }
    if (sources.some((source) => /(?:^|\/)next\.config\./i.test(source.path) &&
      pathIsWithin(source.path, nearestPackage.root))) localFrameworks.add('Next.js');
    return localFrameworks;
  };

  const aliases = parseTypeScriptAliases(sources);
  const fileInfos: FileInfo[] = [];
  const routeNodes = new Map<string, { id: string; routePath: string; kind: 'route' | 'api'; hint: string; level: ArchitectureEvidenceLevel }>();
  const schemaNodes = new Map<string, { id: string; label: string; hint: string }>();
  const declaredApiRoutes: Array<{ filePath: string; method: string; routePath: string }> = [];
  let parserErrorCount = 0;
  let parsedFileCount = 0;
  const languageSet = new Set<string>();

  for (const source of sources) {
    const extension = extensionOf(source.path);
    const schema = classifySchema(source.path);
    if (!CODE_EXTENSIONS.has(extension) && !schema) continue;
    const language = schema ? 'Schema' : getLanguage(extension);
    languageSet.add(language);
    let imports: string[] = [];
    let apiCalls: string[] = [];
    let apiRoutes: string[] = [];

    if (PARSER_EXTENSIONS.has(extension) || ['.vue', '.svelte', '.astro'].includes(extension)) {
      const parsed = parseJavascriptFile(source, extension);
      imports = parsed.imports;
      apiCalls = parsed.apiCalls;
      apiRoutes = parsed.apiRoutes;
      if (parsed.error) parserErrorCount += 1;
      if (!parsed.error) parsedFileCount += 1;
    } else if (extension === '.py' || extension === '.pyi') {
      imports = [...source.content.matchAll(/^\s*(?:from\s+([.\w]+)\s+import|import\s+([\w.]+))/gm)]
        .map((match) => match[1] || match[2]).filter(Boolean);
      parsedFileCount += 1;
    } else if (extension === '.rs') {
      imports = [...source.content.matchAll(/^\s*(?:pub\s+)?(?:use|mod)\s+([\w:]+)/gm)]
        .map((match) => match[1]).filter(Boolean);
      parsedFileCount += 1;
    } else if (extension === '.go') {
      imports = [...source.content.matchAll(/^\s*import\s+(?:\w+\s+)?["`]([^"`]+)["`]/gm)]
        .map((match) => match[1]).filter(Boolean);
      const importBlocks = source.content.match(/import\s*\(([\s\S]*?)\)/g) || [];
      for (const block of importBlocks) {
        for (const match of block.matchAll(/["`]([^"`]+)["`]/g)) imports.push(match[1]);
      }
      parsedFileCount += 1;
    } else if (extension === '.java' || extension === '.cs') {
      imports = [...source.content.matchAll(/^\s*(?:import|using)\s+([\w.*]+)/gm)]
        .map((match) => match[1]).filter(Boolean);
      parsedFileCount += 1;
    } else if (extension === '.rb') {
      imports = [...source.content.matchAll(/^\s*require_relative\s+["']([^"']+)["']/gm)]
        .map((match) => `./${match[1]}`).filter(Boolean);
      parsedFileCount += 1;
    } else if (extension === '.php') {
      imports = [...source.content.matchAll(/^\s*(?:require|require_once|include|include_once)\s*(?:\(|)\s*["']([^"']+)["']/gm)]
        .map((match) => match[1]).filter((value) => value.startsWith('.') || value.startsWith('/'));
      parsedFileCount += 1;
    }

    for (const declaration of apiRoutes) {
      const splitAt = declaration.indexOf(' ');
      if (splitAt > 0) declaredApiRoutes.push({
        filePath: source.path,
        method: declaration.slice(0, splitAt),
        routePath: declaration.slice(splitAt + 1),
      });
    }

    const route = routeInfoForPath(source.path, frameworksForPath(source.path));
    if (route) {
      routeNodes.set(source.path, {
        id: stableId('route', source.path), routePath: route.path, kind: route.kind,
        hint: route.hint, level: route.level,
      });
    }
    if (schema) schemaNodes.set(source.path, { id: stableId('schema', source.path), ...schema });

    fileInfos.push({
      path: source.path,
      content: source.content,
      extension,
      language,
      kind: 'module',
      evidenceLevel: 'observed',
      imports,
      apiCalls,
      apiRoutes,
      moduleId: '',
    });
  }

  const packageRoots = packageInfos.filter((info) => info.root && info.name);
  const modules = new Map<string, ArchitectureMapModule>();
  const moduleByFile = new Map<string, string>();
  const goModules = sources.filter((source) => basename(source.path).toLowerCase() === 'go.mod').flatMap((source) => {
    const match = source.content.match(/^\s*module\s+([^\s]+)\s*$/m);
    return match ? [{ root: normalizePath(source.path).split('/').slice(0, -1).join('/'), name: match[1] }] : [];
  });
  const namespaceToFile = new Map<string, string>();
  for (const file of fileInfos) {
    const namespacePattern = file.extension === '.java' ? /^\s*package\s+([\w.]+)\s*;/m : /^\s*namespace\s+([\w.]+)\s*[;{]/m;
    const namespace = file.content.match(namespacePattern)?.[1];
    if (namespace) namespaceToFile.set(namespace, file.path);
  }
  const moduleIdForPath = (modulePath: string) => stableId('module', modulePath);

  for (const file of fileInfos) {
    const route = routeNodes.get(file.path);
    const schema = schemaNodes.get(file.path);
    if (route) {
      file.moduleId = route.id;
      moduleByFile.set(file.path, route.id);
      const moduleKind: ArchitectureModuleKind = route.kind;
      modules.set(route.id, {
        id: route.id,
        label: route.routePath,
        path: file.path,
        kind: moduleKind,
        evidenceLevel: route.level,
        roleHint: route.hint,
        fileCount: 1,
        languageCounts: { [file.language]: 1 },
        filePaths: [file.path],
      });
      continue;
    }
    if (schema) {
      file.moduleId = schema.id;
      moduleByFile.set(file.path, schema.id);
      modules.set(schema.id, {
        id: schema.id,
        label: schema.label,
        path: file.path,
        kind: 'schema',
        evidenceLevel: 'observed',
        roleHint: schema.hint,
        fileCount: 1,
        languageCounts: { [file.language]: 1 },
        filePaths: [file.path],
      });
      continue;
    }

    const modulePath = modulePathForFile(file.path, packageRoots);
    const id = moduleIdForPath(modulePath);
    file.moduleId = id;
    moduleByFile.set(file.path, id);
    const existing = modules.get(id);
    if (existing) {
      existing.fileCount += 1;
      existing.languageCounts[file.language] = (existing.languageCounts[file.language] || 0) + 1;
      if (existing.filePaths.length < MAX_FILES_PER_MODULE) existing.filePaths.push(file.path);
    } else {
      const isTest = /(?:^|\/)(?:test|tests|__tests__)(?:\/|$)|\.(?:test|spec)\./i.test(modulePath);
      modules.set(id, {
        id,
        label: getModuleDisplayName(modulePath),
        path: modulePath,
        kind: isTest ? 'test' : packageRoots.some((info) => info.root === modulePath) ? 'package' : 'module',
        evidenceLevel: 'observed',
        roleHint: isTest ? 'Test files grouped by path or filename convention' : undefined,
        fileCount: 1,
        languageCounts: { [file.language]: 1 },
        filePaths: [file.path],
      });
    }
  }

  for (const declaration of declaredApiRoutes) {
    const moduleId = moduleByFile.get(declaration.filePath);
    const module = moduleId ? modules.get(moduleId) : null;
    if (!module) continue;
    module.evidenceLevel = 'observed';
    const hint = `Declares ${declaration.method} ${declaration.routePath}`;
    module.roleHint = `${module.roleHint ? `${module.roleHint}; ` : ''}${hint}`.slice(0, 280);
  }

  const aliasResolve = (specifier: string, sourcePath: string): string | null => {
    const sourceDirectory = normalizePath(sourcePath).split('/').slice(0, -1).join('/');
    for (const alias of aliases) {
      const starAt = alias.pattern.indexOf('*');
      const before = starAt >= 0 ? alias.pattern.slice(0, starAt) : alias.pattern;
      const after = starAt >= 0 ? alias.pattern.slice(starAt + 1) : '';
      if (!specifier.startsWith(before) || (after && !specifier.endsWith(after))) continue;
      const capture = specifier.slice(before.length, after ? -after.length : undefined);
      for (const target of alias.targets) {
        const replaced = starAt >= 0 ? target.replace('*', capture) : target;
        const base = alias.base || sourceDirectory;
        const resolved = resolveLocalPath(`${base ? `${base}/` : ''}${replaced}`, '');
        if (resolved) return resolved;
      }
    }
    return null;
  };

  const resolveLocalPath = (basePath: string, extension: string): string | null => {
    for (const candidate of resolveCandidates(basePath, extension)) {
      const resolved = canonicalPath(candidate);
      if (resolved && CODE_EXTENSIONS.has(extensionOf(resolved))) return resolved;
    }
    return null;
  };

  const workspaceResolve = (specifier: string): string | null => {
    for (const pkg of packageRoots) {
      if (!pkg.name || (specifier !== pkg.name && !specifier.startsWith(`${pkg.name}/`))) continue;
      const subPath = specifier === pkg.name ? '' : specifier.slice(pkg.name.length + 1);
      const resolved = resolveLocalPath(`${pkg.root}/${subPath}`, extensionOf(subPath));
      if (resolved) return resolved;
      if (!subPath) {
        const firstFile = fileInfos.find((file) => pathIsWithin(file.path, pkg.root));
        if (firstFile) return firstFile.path;
      }
    }
    return null;
  };

  const pythonResolve = (specifier: string, sourcePath: string): string | null => {
    const relativeDots = specifier.match(/^\.+/)?.[0].length || 0;
    const modulePart = specifier.slice(relativeDots).replace(/\./g, '/');
    const sourceDirectory = normalizePath(sourcePath).split('/').slice(0, -1);
    if (relativeDots > 0) sourceDirectory.splice(Math.max(0, sourceDirectory.length - (relativeDots - 1)));
    const moduleCandidates = relativeDots > 0
      ? [`${sourceDirectory.join('/')}/${modulePart}`]
      : [modulePart, `src/${modulePart}`, `app/${modulePart}`];
    for (const candidate of moduleCandidates) {
      const normalized = normalizeRelativePath(candidate);
      for (const filePath of [`${normalized}.py`, `${normalized}.pyi`, `${normalized}/__init__.py`, `${normalized}/__init__.pyi`]) {
        const resolved = canonicalPath(filePath);
        if (resolved && ['.py', '.pyi'].includes(extensionOf(resolved))) return resolved;
      }
    }
    return null;
  };

  const rustResolve = (specifier: string, sourcePath: string): string | null => {
    if (/^(?:std|core|alloc|proc_macro)::/.test(specifier)) return null;
    const fileDirectory = normalizePath(sourcePath).split('/').slice(0, -1).join('/');
    const sourceName = basename(sourcePath).replace(/\.rs$/i, '');
    const moduleBase = ['mod', 'lib', 'main'].includes(sourceName) ? fileDirectory : `${fileDirectory}/${sourceName}`;
    let modulePath = specifier.split('::').filter((part) => /^[\w]+$/.test(part)).join('/');
    let base = moduleBase;
    if (specifier.startsWith('crate::')) {
      const crateRoot = fileInfos.find((file) => /(?:^|\/)src\/(?:lib|main)\.rs$/i.test(file.path))?.path || 'src/lib.rs';
      base = normalizePath(crateRoot).split('/').slice(0, -1).join('/');
      modulePath = specifier.slice('crate::'.length).split('::').filter((part) => /^[\w]+$/.test(part)).join('/');
    } else if (specifier.startsWith('super::')) {
      base = moduleBase.split('/').slice(0, -1).join('/');
      modulePath = specifier.slice('super::'.length).split('::').filter((part) => /^[\w]+$/.test(part)).join('/');
    } else if (specifier.startsWith('self::')) {
      modulePath = specifier.slice('self::'.length).split('::').filter((part) => /^[\w]+$/.test(part)).join('/');
    }
    if (!modulePath) return null;
    for (const candidate of [`${base}/${modulePath}`, `${base}/${modulePath}.rs`, `${base}/${modulePath}/mod.rs`]) {
      const resolved = canonicalPath(candidate);
      if (resolved && extensionOf(resolved) === '.rs') return resolved;
    }
    return null;
  };

  const resolveImportPath = (specifier: string, source: FileInfo): string | null => {
    const sourceDirectory = normalizePath(source.path).split('/').slice(0, -1).join('/');
    if (['Python'].includes(source.language)) return pythonResolve(specifier, source.path);
    if (source.language === 'Rust') return rustResolve(specifier, source.path);
    if (source.language === 'Go') {
      const module = goModules.filter((item) => pathIsWithin(source.path, item.root)).sort((left, right) => right.root.length - left.root.length)[0];
      if (!module || !specifier.startsWith(`${module.name}/`)) return null;
      const importedDirectory = normalizeRelativePath(`${module.root}/${specifier.slice(module.name.length + 1)}`);
      return fileInfos.find((file) => file.language === 'Go' && normalizePath(file.path).split('/').slice(0, -1).join('/') === importedDirectory)?.path || null;
    }
    if (source.language === 'Java' || source.language === 'C#') {
      const namespace = specifier.replace(/^static\s+/, '').replace(/\.$/, '');
      if (namespace.endsWith('.*')) {
        const prefix = namespace.slice(0, -2);
        return [...namespaceToFile.entries()].find(([name]) => name.startsWith(`${prefix}.`))?.[1] || null;
      }
      if (source.language === 'Java') {
        const importedPath = `${namespace.split('.').join('/')}.java`;
        const exact = canonicalPath(importedPath);
        if (exact) return exact;
      }
      return namespaceToFile.get(namespace) || null;
    }
    if (['Ruby', 'PHP'].includes(source.language) || specifier.startsWith('.') || specifier.startsWith('/')) {
      return resolveLocalPath(specifier.startsWith('/') ? specifier.slice(1) : `${sourceDirectory}/${specifier}`, extensionOf(specifier));
    }
    return aliasResolve(specifier, source.path) || workspaceResolve(specifier);
  };

  const dependencyCounts = new Map<string, Map<string, { count: number; evidencePaths: Set<string> }>>();
  const externalCounts = new Map<string, Map<string, { count: number; evidencePaths: Set<string> }>>();
  const apiRequests: Array<{ source: FileInfo; path: string }> = [];

  for (const file of fileInfos) {
    for (const specifier of file.imports) {
      const targetPath = resolveImportPath(specifier, file);

      if (targetPath) {
        const targetModuleId = moduleByFile.get(targetPath);
        if (!targetModuleId || targetModuleId === file.moduleId) continue;
        const connections = dependencyCounts.get(file.moduleId) || new Map();
        const connection = connections.get(targetModuleId) || { count: 0, evidencePaths: new Set<string>() };
        connection.count += 1;
        if (connection.evidencePaths.size < MAX_EVIDENCE_PATHS) connection.evidencePaths.add(file.path);
        connections.set(targetModuleId, connection);
        dependencyCounts.set(file.moduleId, connections);
      } else {
        const packageName = getPackageName(specifier);
        if (!packageName || NODE_BUILTINS.has(packageName) || !allDeclaredDependencies.has(packageName)) continue;
        const dependencies = externalCounts.get(file.moduleId) || new Map();
        const dependency = dependencies.get(packageName) || { count: 0, evidencePaths: new Set<string>() };
        dependency.count += 1;
        if (dependency.evidencePaths.size < MAX_EVIDENCE_PATHS) dependency.evidencePaths.add(file.path);
        dependencies.set(packageName, dependency);
        externalCounts.set(file.moduleId, dependencies);
      }
    }
    for (const routePath of file.apiCalls) apiRequests.push({ source: file, path: routePath });
  }

  const externalFrequency = new Map<string, number>();
  for (const dependencies of externalCounts.values()) {
    for (const [name, info] of dependencies) externalFrequency.set(name, (externalFrequency.get(name) || 0) + info.count);
  }
  const popularExternalPackages = [...externalFrequency.entries()].sort((left, right) => right[1] - left[1]).slice(0, 18).map(([name]) => name);
  const externalNodeIds = new Map<string, string>();
  for (const name of popularExternalPackages) {
    const id = stableId('package', name);
    externalNodeIds.set(name, id);
    modules.set(id, {
      id,
      label: name,
      path: `package:${name}`,
      kind: 'package',
      evidenceLevel: 'observed',
      roleHint: 'Declared package imported by project source',
      fileCount: 0,
      languageCounts: {},
      filePaths: [],
    });
  }

  const routeTargets = new Map<string, string[]>();
  for (const route of routeNodes.values()) {
    if (route.kind !== 'api') continue;
    const key = route.routePath.replace(/\/$/, '') || '/';
    routeTargets.set(key, [...(routeTargets.get(key) || []), route.id]);
  }
  for (const declaration of declaredApiRoutes) {
    const targetId = moduleByFile.get(declaration.filePath);
    if (!targetId) continue;
    const key = declaration.routePath.replace(/\/$/, '') || '/';
    routeTargets.set(key, [...(routeTargets.get(key) || []), targetId]);
  }

  const connectionMap = new Map<string, ArchitectureMapConnection>();
  const addConnection = (source: string, target: string, relation: ArchitectureMapConnection['relation'], level: ArchitectureEvidenceLevel, evidencePath: string) => {
    if (!modules.has(source) || !modules.has(target) || source === target) return;
    const id = stableId('edge', `${source}|${target}|${relation}`);
    const connection = connectionMap.get(id) || {
      id, source, target, relation, evidenceLevel: level, count: 0, evidencePaths: [],
    };
    connection.count += 1;
    if (!connection.evidencePaths.includes(evidencePath) && connection.evidencePaths.length < MAX_EVIDENCE_PATHS) {
      connection.evidencePaths.push(evidencePath);
    }
    connectionMap.set(id, connection);
  };

  for (const [source, dependencies] of dependencyCounts) {
    for (const [target, info] of dependencies) {
      addConnection(source, target, 'imports', 'observed', [...info.evidencePaths][0] || '');
      const id = stableId('edge', `${source}|${target}|imports`);
      const edge = connectionMap.get(id);
      if (edge) {
        edge.count = info.count;
        edge.evidencePaths = [...info.evidencePaths].slice(0, MAX_EVIDENCE_PATHS);
      }
    }
  }

  for (const [source, dependencies] of externalCounts) {
    for (const [packageName, info] of dependencies) {
      const target = externalNodeIds.get(packageName);
      if (!target) continue;
      addConnection(source, target, 'imports', 'observed', [...info.evidencePaths][0] || '');
      const edge = connectionMap.get(stableId('edge', `${source}|${target}|imports`));
      if (edge) {
        edge.count = info.count;
        edge.evidencePaths = [...info.evidencePaths].slice(0, MAX_EVIDENCE_PATHS);
      }
    }
  }

  for (const request of apiRequests) {
    const requestedPath = request.path.replace(/\/$/, '') || '/';
    const matchingTargets = routeTargets.get(requestedPath) || [...routeTargets.entries()]
      .filter(([routePath]) => routePathMatches(routePath, requestedPath))
      .flatMap(([, ids]) => ids);
    for (const routeId of matchingTargets) addConnection(request.source.moduleId, routeId, 'calls-api', 'inferred', request.source.path);
  }

  for (const schema of schemaNodes.entries()) {
    const [schemaPath, schemaInfo] = schema;
    const candidates = new Set([schemaPath, basename(schemaPath)]);
    for (const source of sources) {
      if (source.path === schemaPath || !CODE_EXTENSIONS.has(extensionOf(source.path))) continue;
      const content = source.content.replace(/\\/g, '/');
      const matchedReference = [...candidates].find((candidate) => candidate && content.includes(candidate));
      if (!matchedReference) continue;
      const sourceModuleId = moduleByFile.get(source.path);
      if (sourceModuleId) addConnection(sourceModuleId, schemaInfo.id, 'uses-schema', 'inferred', source.path);
    }
  }

  const moduleList = [...modules.values()].sort((left, right) => left.path.localeCompare(right.path));
  const connectionList = [...connectionMap.values()]
    .sort((left, right) => right.count - left.count || left.source.localeCompare(right.source))
    .slice(0, MAX_CONNECTIONS);
  const keptIds = new Set(moduleList.slice(0, MAX_MODULES).map((item) => item.id));
  const keptModules = moduleList.filter((item) => keptIds.has(item.id));
  const keptConnections = connectionList.filter((item) => keptIds.has(item.source) && keptIds.has(item.target));
  const mapLimitations = input.sourceSummary.limitations.slice();
  if (parserErrorCount > 0) mapLimitations.push(`${parserErrorCount} JavaScript, TypeScript, or component-script files could not be fully parsed; some relationships may be missing.`);
  if (languageSet.size > 0) mapLimitations.push('JavaScript and TypeScript imports use a syntax parser. Other listed languages use conservative import-pattern matching; unresolved and dynamic imports are omitted.');
  if (languageSet.size > 0) mapLimitations.push('External package nodes currently use package.json declarations; other language ecosystems are shown only when imports resolve to scanned local files.');
  if (moduleList.length > MAX_MODULES || connectionList.length > MAX_CONNECTIONS) mapLimitations.push('The visual map is capped to keep the canvas readable; some modules or lower-frequency connections are omitted.');
  if (externalFrequency.size > popularExternalPackages.length) mapLimitations.push('Only the most frequently imported declared packages are shown as individual nodes.');
  if (!routeNodes.size) mapLimitations.push('No framework routes were recognized from the detected conventions.');
  if (!schemaNodes.size) mapLimitations.push('No supported schema or API-contract files were found.');

  return {
    modules: keptModules,
    connections: keptConnections,
    summary: {
      scannedAt: new Date().toISOString(),
      scannedFileCount: input.sourceSummary.discoveredFiles,
      parsedFileCount,
      moduleCount: keptModules.length,
      connectionCount: keptConnections.length,
      languages: [...languageSet].sort(),
      frameworks: [...frameworks].sort(),
      parserErrorCount,
      truncated: input.sourceSummary.truncated || moduleList.length > MAX_MODULES || connectionList.length > MAX_CONNECTIONS,
      limitations: [...new Set(mapLimitations)].slice(0, 20),
    },
  };
}

if (typeof self !== 'undefined' && typeof (self as any).postMessage === 'function') {
  const workerScope = self as unknown as {
    onmessage: ((event: MessageEvent<WorkerInput>) => void) | null;
    postMessage: (value: unknown) => void;
  };

  workerScope.onmessage = (event) => {
    try {
      workerScope.postMessage({ success: true, map: buildArchitectureMap(event.data) });
    } catch {
      workerScope.postMessage({ success: false, error: 'Formative could not build an architecture map from these files.' });
    }
  };
}
