App.SubRoute = Ember.Route.extend

  setupController: (controller, model)->
    controller.set 'model', model
    @setWatched model
    channelId = model.get 'channelId'
    App.youTube.getVideosByChannel(channelId).then (videos)=>
      model.set 'videos', Ember.ArrayProxy.create content: videos.map (video)=>
        videoModel = Ember.Object.create video
        @setWatched videoModel
        videoModel

  setWatched: (video)->
    App.Store.List.has('watched_videos', video.get('videoId')).then (watched)=>
      video.set 'watched', watched
