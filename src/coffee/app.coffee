define ['backbone', 'views/app'], (Backbone, AppView) ->

  class AppRouter extends Backbone.Router
    start: ->
      Backbone.history.start pushState: true
      new AppView

  new AppRouter
