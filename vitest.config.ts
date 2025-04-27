import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfigFn from './vite.config'

const viteConfig = viteConfigFn;

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      include: ['tests/*.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
