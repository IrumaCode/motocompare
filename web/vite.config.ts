/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Single .env at the monorepo root; only VITE_* variables reach the browser
  envDir: '..',
  server: {
    // Same-origin requests in development: no CORS setup needed in the API
    proxy: { '/graphql': 'http://localhost:4000' },
  },
  // Vitest reuses this file, so tests run with the same plugins and aliases as the app
  test: {
    // A simulated browser (DOM, localStorage, events) inside Node
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
  },
});
