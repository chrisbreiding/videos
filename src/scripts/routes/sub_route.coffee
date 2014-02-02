App.SubRoute = Ember.Route.extend

  model: (params)->
    @store.find 'sub', params.sub_id
