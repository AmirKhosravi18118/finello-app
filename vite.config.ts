import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // VITE_BASE is set by the GitHub Pages deploy workflow (/finello-app/); local dev keeps '/'.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5173 },
  // unit tests live in src/ — e2e/*.spec.ts belongs to Playwright, not vitest
  test: { include: ['src/**/*.test.{ts,tsx}'] },
})
