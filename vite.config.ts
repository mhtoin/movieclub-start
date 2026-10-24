import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const BUILD_TIMESTAMP = Date.now()

const config = defineConfig({
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(BUILD_TIMESTAMP),
  },
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rolldownOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names[0] ?? ''
          if (name === 'styles.css') {
            return 'assets/styles[extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-is|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-recharts',
              test: /recharts|d3-/,
              priority: 10,
            },
            {
              name: 'vendor-framer-motion',
              test: /framer-motion/,
              priority: 10,
            },
            {
              name: 'vendor-dnd-kit',
              test: /@dnd-kit/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  plugins: [
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
      noExternals: [
        // Bundle recharts' transitive deps instead of externalizing them.
        // These are needed at runtime but aren't in the output node_modules.
        'decimal.js-light',
        'recharts-scale',
        'react-smooth',
      ],
    }),
    viteReact(),
    // Keep React Compiler as a Babel transform; plugin-react 6 no longer
    // accepts inline Babel configuration.
    babel({ presets: [reactCompilerPreset()] }),
  ],
  ssr: {
    // Bundle recharts' transitive dependencies that would otherwise be
    // treated as external and missing at runtime in the Nitro output.
    noExternal: [/decimal\.js/, /recharts-scale/, /react-smooth/],
  },
})

export default config
