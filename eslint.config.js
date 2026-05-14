//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: [
      '.output/**',
      '.nitro/**',
      '.tanstack/**',
      '.vinxi/**',
      'dist/**',
      'dist-ssr/**',
      'node_modules/**',
    ],
  },
  ...tanstackConfig,
  reactHooks.configs.flat['recommended-latest'],
  // useAppSession is a TanStack Start server session helper, not a React hook.
  // These files call it inside async server handlers, so rules-of-hooks
  // warnings are false positives.
  {
    files: [
      'src/routes/api/**/*.ts',
      'src/routes/login/**/callback.tsx',
      'src/lib/auth/auth.ts',
    ],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  // Temporarily downgrade new compiler-specific rules to warnings while
  // the codebase is incrementally fixed. Components with violations will
  // simply be skipped by the compiler (safe fallback).
  {
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/use-memo': 'warn',
    },
  },
]
