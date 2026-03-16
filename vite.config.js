/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/algoquest/',
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5174,
    strictPort: !!process.env.PORT,
  },
})
