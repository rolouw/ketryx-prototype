import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built site works from any host or sub-path (e.g. GitHub Pages).
  base: './',
  server: { port: 5173, strictPort: true },
});
