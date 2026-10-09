import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/hooks': '/src/hooks',
      '@/lib': '/src/lib',
      '@/pages': '/src/pages',
      '@/store': '/src/store',
      '@/types': '/src/types',
      '@/styles': '/src/styles',
    },
  },
})