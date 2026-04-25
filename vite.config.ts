import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/_tavily': {
        target: 'https://api.tavily.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_tavily/, ''),
      },
    },
  },
});
