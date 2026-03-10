import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
});
