import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Use a stable (hash-free) filename for CSS so the server and client
        // builds always reference the same URL, regardless of minor Tailwind
        // processing differences between Linux and macOS Docker environments.
        // Cache invalidation relies on Cache-Control: no-cache + ETag.
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? ''
          if (name.endsWith('.css')) {
            return 'assets/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        manualChunks(id) {
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
        // The main stylesheet has a stable name — revalidate on every request
        '/assets/styles.css': {
          headers: { 'Cache-Control': 'no-cache, must-revalidate' },
        },
        // All other hashed assets never change — cache forever
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
