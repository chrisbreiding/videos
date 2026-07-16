import { defineConfig, type PluginOption } from 'vite'

export default defineConfig(async () => {
  const plugins: PluginOption[] = []

  // When COVERAGE is set (see `npm run test:coverage`), instrument the source
  // with Istanbul so Playwright can collect per-test code coverage. The plugin
  // is ESM-only, so it is loaded via dynamic import and only when needed.
  if (process.env.COVERAGE) {
    const istanbul = (await import('vite-plugin-istanbul')).default

    plugins.push(istanbul({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules', 'tests', '**/*.d.ts'],
      extension: ['.ts', '.tsx'],
      requireEnv: false,
    }))
  }

  return {
    plugins,
    server: {
      port: 8001,
    },
  }
})
