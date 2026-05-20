import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // For GitHub Pages, set VITE_BASE_PATH=/<repo-name>/ before build.
  const base = env.VITE_BASE_PATH || '/';

  return {
    base,
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: false,
      open: false,
      host: true,
      allowedHosts: ['.ngrok-free.app', '.ngrok.app', '.ngrok.io', '.ngrok.dev', 'localhost'],
      proxy: {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
      },
      hmr: { clientPort: 443 },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
