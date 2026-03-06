import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro({
      routeRules: {
        // Hashed assets never change — cache forever
        '/assets/**': {
          headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
        },
        // HTML documents must not be cached so redeployed asset hashes are always fresh
        '/**': {
          headers: { 'Cache-Control': 'no-store, no-cache' },
        },
      },
    }),
    viteReact(),
  ],
})

export default config
