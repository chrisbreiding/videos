App.SubRoute = Ember.Route.extend

  # model: (params)->
  #   console.log 'sub route model'
  #   @store.find('sub', params.sub_id).then (model)->
  #     channelId = model.get 'channelId'
  #     App.youTube.getVideosByChannel(channelId).then (videos)->
  #       model.set 'videos', Ember.ArrayProxy.create content: videos.map (video)->
  #         App.Video.createRecord video
  #       model

  setupController: (controller, model)->
    controller.set 'model', model
    channelId = model.get 'channelId'
    App.youTube.getVideosByChannel(channelId).then (videos)->
      model.set 'videos', Ember.ArrayProxy.create content: videos.map (video)->
        App.Video.createRecord video
