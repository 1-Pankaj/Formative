import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'website',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './website/src'),
      '@app': path.resolve(__dirname, './src'),
      'motion/react': 'framer-motion',
    },
  },
  server: {
    port: 5174,
  },
  build: {
    outDir: '../dist-website',
    emptyOutDir: true,
  },
  base: '/Formative/',
});
