import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // We check for VITE_API_KEY first (Vercel standard), then API_KEY
  // We also check process.env directly as Vercel injects system vars there during build
  const apiKey = process.env.VITE_API_KEY || env.VITE_API_KEY || process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    // This defines 'process.env.API_KEY' globally in the browser code
    // preventing "process is not defined" errors and injecting the key
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});