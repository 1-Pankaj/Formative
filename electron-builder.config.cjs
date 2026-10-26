const fs = require('node:fs');
const path = require('node:path');

const localModelPath = path.join(__dirname, 'LLM', 'formativellm.gguf');
const includeLocalModel = process.env.FORMATIVE_BUNDLE_LLM === '1' && fs.existsSync(localModelPath);

module.exports = {
  appId: 'dev.formative.studio',
  productName: 'Formative',
  directories: { output: process.env.FORMATIVE_BUILD_OUTPUT || 'build-release' },
  files: [
    'dist/**/*',
    'electron/**/*',
    'public/icon.ico',
    'public/assets/**/*',
    'package.json',
  ],
  extraResources: [
    { from: 'LICENSE', to: 'LICENSE' },
    { from: 'THIRD_PARTY_NOTICES.md', to: 'THIRD_PARTY_NOTICES.md' },
    ...(includeLocalModel ? [{ from: localModelPath, to: 'llm/formativellm.gguf' }] : []),
  ],
  win: {
    target: ['nsis', 'portable'],
    icon: 'public/icon.ico',
    requestedExecutionLevel: 'asInvoker',
  },
  nsis: {
    artifactName: '${productName}-Setup-${version}.${ext}',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Formative',
  },
  portable: {
    artifactName: '${productName}-Portable-${version}.${ext}',
  },
};
