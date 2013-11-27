App.SubsRoute = Ember.Route.extend

  model: ->
    @store.find 'sub'
