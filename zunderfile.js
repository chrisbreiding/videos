const zunder = require('zunder')

zunder.setConfig({
  staticGlobs: {
    'static/**': '',
    'node_modules/font-awesome/fonts/**': '/fonts',
  },
})
