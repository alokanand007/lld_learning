import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/lld_learning/',
  plugins: [
    react(),
    {
      name: 'copy-404-for-gh-pages',
      closeBundle() {
        const distDir = fileURLToPath(new URL('./dist', import.meta.url));
        const indexPath = `${distDir}/index.html`;
        const notFoundPath = `${distDir}/404.html`;
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath);
        }
      }
    }
  ],
  server: {
    port: 3000,
    open: false
  },
  test: {
    globals: true,
    environment: 'happy-dom'
  }
});
