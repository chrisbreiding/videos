App.SubRoute = Ember.Route.extend

  setupController: (controller, model)->
    controller.set 'model', model
    id = model.get 'id'
    App.youTube.getVideosByChannel(id).then (videos)=>
      model.set 'videos', Ember.ArrayProxy.create content: videos.map (video)=>
        videoModel = Ember.Object.create video
        @setWatched model, videoModel
        videoModel

  setWatched: (model, video)->
    App.Store.List.has("watched_videos_#{model.get('id')}", video.get('id')).then (watched)=>
      video.set 'watched', watched
