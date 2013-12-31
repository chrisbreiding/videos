App.IndexRoute = Ember.Route.extend

  redirect: -> @transitionTo 'subs'
    # App.Sub.find().then (subs)=>
    #   defaultSub = _.find subs, (sub)-> sub.get 'default'
    #   if defaultSub
    #     @transitionTo 'sub', defaultSub
    #   else
    #     @transitionTo 'subs'
