const { defineConfig } = require('vite')

module.exports = defineConfig(async () => {
  const plugins = []

  // When COVERAGE is set (see `npm run test:coverage`), instrument the source
  // with Istanbul so Playwright can collect per-test code coverage. The plugin
  // is ESM-only, so it is loaded via dynamic import and only when needed.
  if (process.env.COVERAGE) {
    const istanbul = (await import('vite-plugin-istanbul')).default

    plugins.push(istanbul({
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: ['node_modules', 'tests'],
      extension: ['.js', '.jsx'],
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
