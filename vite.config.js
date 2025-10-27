import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Changed from /CodePathAfterHours2DLists/ for Vercel
  optimizeDeps: {
    exclude: ['pyodide']
  }
});
