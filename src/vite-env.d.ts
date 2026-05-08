/// <reference types="vite/client" />

declare const __BUILD_TIMESTAMP__: string

declare module '@tanstack/eslint-config' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const config: Array<import('eslint').Linter.Config>
  export { config as tanstackConfig }
}
