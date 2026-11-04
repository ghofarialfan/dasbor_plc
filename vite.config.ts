import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { output: { manualChunks(id) {
    if (/node_modules\/(recharts|recharts-scale|d3-|victory-vendor|lodash)/.test(id)) return 'charts';
    if (id.includes('node_modules')) return 'vendor';
  } } } },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});