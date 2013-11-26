App.SubsRoute = Ember.Route.extend

  model: ->
    console.log 'subs route model'
    @store.find 'sub'
