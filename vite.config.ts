/**
 * Vite build setup for Welcome to Futbol.
 * Owns the React plugin; no special path aliases in v1.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
