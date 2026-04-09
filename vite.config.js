import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Increase chunk size warning limit (vendor chunks may exceed default 500kB)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor dependencies into separate cacheable chunks
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          'vendor-http': ['axios'],
        },
      },
    },
  },
});
