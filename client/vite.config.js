import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    // Proxy /api → game server (so client can call /api/rooms etc.)
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
    hmr: {
      clientPort: 5173,
      protocol: 'wss',
      host: 'localhost',
    },
  },
  // Discord Activity iframe needs .proxy route mapping to specific path
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
});