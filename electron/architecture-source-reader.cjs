const fs = require('fs');
const path = require('path');

const MAX_VISITED_ENTRIES = 30000;
const MAX_SOURCE_FILES = 2500;
const MAX_SOURCE_FILE_BYTES = 192 * 1024;
const MAX_MANIFEST_BYTES = 96 * 1024;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;

const IGNORED_DIRECTORY_NAMES = new Set([
  '.git', '.hg', '.svn', '.idea', '.vscode', '.next', '.nuxt', '.output', '.turbo',
  '.vercel', '.cache', '.parcel-cache', '.pytest_cache', '.mypy_cache', '.ruff_cache',
  '.venv', 'venv', 'env', 'node_modules', 'bower_components', 'dist', 'build', 'out',
  'coverage', 'vendor', 'target', 'bin', 'obj', 'pods', 'deriveddata',
]);

const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts',
  '.py', '.pyi', '.go', '.rs', '.java', '.cs', '.php', '.rb', '.vue', '.svelte', '.astro',
]);

const MANIFEST_NAMES = new Set([
  'package.json', 'tsconfig.json', 'jsconfig.json', 'go.mod', 'cargo.toml',
  'pyproject.toml', 'composer.json', 'pom.xml', 'build.gradle', 'build.gradle.kts',
]);

const SCHEMA_FILE_PATTERN = /(?:^|\/)(?:schema|openapi|swagger|.*\.schema)\.(?:prisma|sql|graphql|gql|proto|ya?ml|json)$/i;
const SECRET_FILE_NAMES = new Set([
  '.npmrc', '.pypirc', '.env', '.env.local', '.env.development', '.env.production',
  'credentials.json', 'secrets.json', 'service-account.json', 'id_rsa', 'id_ed25519',
]);

function escapeRegexCharacter(character) {
  return character.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function compileIgnorePattern(rawPattern) {
  let pattern = rawPattern.trim();
  if (!pattern || pattern === '!' || pattern.startsWith('#')) return null;

  let negated = false;
  if (pattern.startsWith('!')) {
    negated = true;
    pattern = pattern.slice(1);
  }
  if (!pattern) return null;

  const anchored = pattern.startsWith('/');
  if (anchored) pattern = pattern.slice(1);
  const directoryOnly = pattern.endsWith('/');
  if (directoryOnly) pattern = pattern.slice(0, -1);
  const hasSlash = pattern.includes('/');
  let body = '';

  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === '*' && pattern[index + 1] === '*') {
      index += 1;
      if (pattern[index + 1] === '/') {
        index += 1;
        body += '(?:.*/)?';
      } else {
        body += '.*';
      }
    } else if (character === '*') {
      body += '[^/]*';
    } else if (character === '?') {
      body += '[^/]';
    } else if (character === '[') {
      const closing = pattern.indexOf(']', index + 1);
      if (closing > index + 1) {
        let group = pattern.slice(index + 1, closing);
        if (group.startsWith('!')) group = `^${group.slice(1)}`;
        body += `[${group}]`;
        index = closing;
      } else {
        body += '\\[';
      }
    } else {
      body += escapeRegexCharacter(character);
    }
  }

  const prefix = anchored || hasSlash ? '^' : '(?:^|.*/)';
  const suffix = directoryOnly ? '(?:/.*)?$' : '$';
  try {
    return { negated, expression: new RegExp(`${prefix}${body}${suffix}`) };
  } catch {
    return null;
  }
}

function appendIgnoreRules(contents, basePath, rules) {
  for (const line of contents.split(/\r?\n/)) {
    const compiled = compileIgnorePattern(line);
    if (compiled) rules.push({ ...compiled, basePath });
  }
}

function isIgnored(relativePath, rules) {
  let ignored = false;
  for (const rule of rules) {
    const scopedPath = rule.basePath
      ? relativePath.startsWith(`${rule.basePath}/`) ? relativePath.slice(rule.basePath.length + 1) : ''
      : relativePath;
    if (scopedPath && rule.expression.test(scopedPath)) ignored = !rule.negated;
  }
  return ignored;
}

function isSafeRelativePath(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.posix.isAbsolute(relativePath)) return false;
  const normalized = path.posix.normalize(relativePath.replace(/\\/g, '/'));
  return normalized !== '..' && !normalized.startsWith('../') && normalized === relativePath.replace(/\\/g, '/');
}

async function readArchitectureSources(folderPath) {
  const rootPath = path.normalize(path.resolve(await fs.promises.realpath(folderPath)));
  const sourceFiles = [];
  const limitations = [];
  const rootIgnoreRules = [];
  let visitedEntries = 0;
  let ignoredFiles = 0;
  let unreadableFiles = 0;
  let oversizedFiles = 0;
  let totalBytes = 0;
  let truncated = false;

  try {
    const ignorePath = path.join(rootPath, '.gitignore');
    const ignoreStats = await fs.promises.lstat(ignorePath);
    if (ignoreStats.isFile() && !ignoreStats.isSymbolicLink() && ignoreStats.size <= MAX_MANIFEST_BYTES) {
      appendIgnoreRules(await fs.promises.readFile(ignorePath, 'utf8'), '', rootIgnoreRules);
    }
  } catch {
    // A missing or unreadable root .gitignore is not an analysis failure.
  }

  async function walk(directoryPath, relativeDirectory, inheritedRules) {
    if (truncated) return;
    let entries;
    try {
      entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });
    } catch {
      unreadableFiles += 1;
      return;
    }

    const rules = inheritedRules.slice();
    if (relativeDirectory) {
      try {
        const localIgnorePath = path.join(directoryPath, '.gitignore');
        const stat = await fs.promises.lstat(localIgnorePath);
        if (stat.isFile() && !stat.isSymbolicLink() && stat.size <= MAX_MANIFEST_BYTES) {
          appendIgnoreRules(await fs.promises.readFile(localIgnorePath, 'utf8'), relativeDirectory, rules);
        }
      } catch {
        // Nested ignore files are optional.
      }
    }

    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      visitedEntries += 1;
      if (visitedEntries > MAX_VISITED_ENTRIES) {
        truncated = true;
        return;
      }

      if (entry.name === '.' || entry.name === '..') continue;
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      if (!isSafeRelativePath(relativePath)) continue;
      if (entry.isSymbolicLink()) continue;

      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || IGNORED_DIRECTORY_NAMES.has(entry.name.toLowerCase())) continue;
        await walk(path.join(directoryPath, entry.name), relativePath, rules);
        if (truncated) return;
        continue;
      }
      if (!entry.isFile() || isIgnored(relativePath, rules)) {
        if (entry.isFile()) ignoredFiles += 1;
        continue;
      }

      const basename = entry.name.toLowerCase();
      const extension = path.extname(basename);
      const isManifest = MANIFEST_NAMES.has(basename);
      const isSchema = SCHEMA_FILE_PATTERN.test(relativePath);
      if (SECRET_FILE_NAMES.has(basename) || basename.startsWith('.env')) continue;
      if (!isManifest && !isSchema && !SOURCE_EXTENSIONS.has(extension)) continue;

      if (sourceFiles.length >= MAX_SOURCE_FILES) {
        truncated = true;
        return;
      }

      let stat;
      try {
        stat = await fs.promises.lstat(path.join(directoryPath, entry.name));
      } catch {
        unreadableFiles += 1;
        continue;
      }
      if (!stat.isFile() || stat.isSymbolicLink()) continue;

      const maxBytes = isManifest ? MAX_MANIFEST_BYTES : MAX_SOURCE_FILE_BYTES;
      if (stat.size > maxBytes) {
        oversizedFiles += 1;
        continue;
      }
      if (totalBytes + stat.size > MAX_TOTAL_BYTES) {
        truncated = true;
        return;
      }

      let content;
      try {
        content = await fs.promises.readFile(path.join(directoryPath, entry.name), 'utf8');
      } catch {
        unreadableFiles += 1;
        continue;
      }
      if (content.includes('\u0000')) {
        unreadableFiles += 1;
        continue;
      }

      totalBytes += Buffer.byteLength(content, 'utf8');
      sourceFiles.push({ path: relativePath, content });
    }
  }

  await walk(rootPath, '', rootIgnoreRules);

  if (truncated) limitations.push('The scan reached its file-count, directory-entry, or total-size safety limit; the map may be incomplete.');
  if (oversizedFiles > 0) limitations.push(`${oversizedFiles} large files were skipped to keep analysis bounded.`);
  if (ignoredFiles > 0) limitations.push('Files matched by .gitignore were excluded.');
  if (unreadableFiles > 0) limitations.push(`${unreadableFiles} entries could not be read and were skipped.`);
  limitations.push('Hidden and generated directories, including dependency and build output folders, are excluded.');
  limitations.push('Analysis is local and static: Formative does not run project code, install dependencies, or send source files over the network.');
  limitations.push('Symbol-level calls, runtime-only relationships, and generated code are not represented.');

  return {
    success: true,
    sources: sourceFiles,
    summary: {
      discoveredFiles: sourceFiles.length,
      totalBytes,
      caseSensitivePaths: process.platform !== 'win32',
      ignoredFiles,
      oversizedFiles,
      unreadableFiles,
      truncated,
      limitations,
    },
  };
}

module.exports = { readArchitectureSources };
