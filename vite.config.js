import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // On GitHub Pages the site lives at /repo-name/ — this env var is set by the Actions workflow
  base: process.env.VITE_BASE_PATH || '/',
})
