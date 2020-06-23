const zunder = require('zunder')

const { browserifyOptions } = zunder.config
const { babel } = zunder.defaults

// enable sourcemaps
browserifyOptions.debug = true
// enable async/await
browserifyOptions.transform[0][1].plugins.push([
  babel.pluginTransformRuntime.module,
  babel.pluginTransformRuntime.options,
])

zunder.setConfig({
  browserifyOptions,
  deployBranch: 'production',
  staticGlobs: {
    'static/**': '',
    'node_modules/font-awesome/fonts/**': '/fonts',
  },
  stylesheets: {
    'src/main.styl': {
      watch: ['src/**/*.styl'],
      output: 'app.css',
    },
  },
})
