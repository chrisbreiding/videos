App.SubRoute = Ember.Route.extend

  setupController: (controller, model)->
    controller.set 'model', model
    channelId = model.get 'channelId'
    App.youTube.getVideosByChannel(channelId).then (videos)->
      model.set 'videos', Ember.ArrayProxy.create content: videos.map (video)->
        Ember.Object.create video
