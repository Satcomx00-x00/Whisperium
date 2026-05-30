import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;

const commitSha = (() => {
  if (process.env.VITE_COMMIT_SHA) return process.env.VITE_COMMIT_SHA;
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
})();

const buildDate = process.env.VITE_BUILD_DATE ?? new Date().toISOString().slice(0, 10);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __COMMIT_SHA__: JSON.stringify(commitSha),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host ?? false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
});
