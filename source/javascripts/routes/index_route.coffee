App.IndexRoute = Ember.Route.extend

  redirect: ->
    @store.find('sub', default: true).then (currentDefaults)=>
      if currentDefaults.get('content').length
        @transitionTo 'sub', currentDefaults.get 'firstObject'
      else
        @transitionTo 'subs'
