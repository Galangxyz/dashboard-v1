// Portable vite.config.js — use this when migrating to a plain React/Vite project
// Replace the platform vite.config.js with this file when porting to GitHub/Vercel

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})