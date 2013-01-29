requirejs.config
  baseUrl: 'js'
  paths:
    jquery: 'lib/jquery.min'
    underscore: 'lib/underscore.min'
    backbone: 'lib/backbone.min'
    localstorage: 'lib/backbone.localstorage.min'
    text: 'lib/require.text.min'
    handlebars: 'lib/handlebars.min'
    moment: 'lib/moment.min'
    template: '/templates'
  shim:
    backbone:
      deps: ['jquery', 'underscore']
      exports: 'Backbone'
    underscore:
      exports: '_'

require ['app/app-router'], (app)->
  app.start()
