const zunder = require('zunder')

zunder.setConfig({
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
