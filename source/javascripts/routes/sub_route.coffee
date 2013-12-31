App.SubRoute = Ember.Route.extend

  setupController: (controller, model)->
    controller.set 'model', model
    id = model.get 'id'
    App.youTube.getVideosByChannel(id).then (videos)=>
      model.set 'videos', Ember.ArrayProxy.create content: videos.map (video)=>
        videoModel = Ember.Object.create video
        @setWatched videoModel
        videoModel

  setWatched: (video)->
    @store.find('watched_video').then (watchedVideos)=>
      video.set 'watched', _.any watchedVideos.get('content'), (watchedVideo)->
        video.get('id') is watchedVideo.get('id')
