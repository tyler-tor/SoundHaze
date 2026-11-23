// frontend/vite.config.js (S21: replaces Create React App)
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Reads frontend/.env, .env.local, .env.<mode> (all optional).
  // Only VITE_* variables are exposed to the browser code (import.meta.env.VITE_*).
  const env = loadEnv(mode, process.cwd(), '');
  // Where the dev server forwards /api requests. Default: the backend on port 5000.
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      // Same idea as CRA's "proxy" field: the browser talks only to
      // localhost:3000, so cookies (login + CSRF) are same-origin.
      proxy: {
        '/api': { target: backendUrl, changeOrigin: false },
      },
    },
    preview: { port: 3000 },
    build: {
      outDir: 'dist',
    },
  };
});
