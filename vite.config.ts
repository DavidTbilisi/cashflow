import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base` must match the GitHub Pages project path (served at /cashflow/);
// kept at '/' for local dev/preview so the dev server works at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/cashflow/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
}))
