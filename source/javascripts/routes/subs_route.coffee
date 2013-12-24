App.SubsRoute = Ember.Route.extend

  model: ->
    App.Sub.find()
