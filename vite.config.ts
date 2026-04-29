import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const BUILD_TIMESTAMP = Date.now()

const config = defineConfig({
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(BUILD_TIMESTAMP),
  },
  build: {
    rollupOptions: {
      output: {
        // All assets use content hashes for immutable long-term caching.
        // The CSS is referenced with a build-timestamp query param in __root.tsx
        // for cache busting when the app is redeployed.
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          // React core must be its own chunk so Rollup uses it (not framer-motion)
          // as the shared JSX runtime for all other chunks.
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-is/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-recharts'
          }
          if (id.includes('framer-motion')) {
            return 'vendor-framer-motion'
          }
          if (id.includes('@dnd-kit')) {
            return 'vendor-dnd-kit'
          }
        },
      },
    },
  },
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro({
      routeRules: {
        // All hashed assets never change — cache forever
        '/assets/**': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        // HTML documents must not be cached so updated asset references are always fresh
        '/**': {
          headers: { 'Cache-Control': 'no-store, no-cache' },
        },
      },
    }),
    viteReact(),
  ],
})

export default config
