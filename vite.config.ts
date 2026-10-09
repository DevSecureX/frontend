import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// PWA manifest is configured in public/site.webmanifest

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react()
      // PWA functionality provided via web manifest and service worker
    ],
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
    server: {
      port: 5173,
      host: true,
      // Proxy API requests to backend during development
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8010',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      } : undefined,
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      target: 'esnext',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      // Production optimizations
      minify: mode === 'production' ? 'esbuild' : false,
      // PWA optimizations
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React ecosystem
            'react-vendor': ['react', 'react-dom'],
            'react-router': ['react-router-dom'],
            
            // UI components and styling
            'ui-radix': [
              '@radix-ui/react-dialog', 
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-popover',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-avatar'
            ],
            'ui-icons': ['lucide-react'],
            
            // State management and data fetching
            'state-management': ['zustand', 'immer'],
            'data-fetching': ['@tanstack/react-query', 'axios'],
            
            // Form handling
            'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            
            // Utilities and date handling
            'utilities': ['date-fns', 'sonner', 'class-variance-authority'],
            
            // Socket.IO for real-time features
            'realtime': ['socket.io-client']
          },
          // Better file naming for caching
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            if (/\.(css)$/.test(assetInfo.name || '')) {
              return `css/[name]-[hash].${ext}`
            }
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
              return `images/[name]-[hash].${ext}`
            }
            return `assets/[name]-[hash].${ext}`
          }
        },
      },
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
        'zustand',
        'immer',
        '@tanstack/react-query',
        'axios',
        'date-fns',
        'lucide-react',
        'socket.io-client',
        'sonner'
      ],
      exclude: ['@radix-ui/react-icons']
    },
  }
})
