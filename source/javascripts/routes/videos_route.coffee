App.VideosRoute = Ember.Route.extend

  model: ->
    id = @modelFor('sub').get 'id'
    App.youTube.getVideosByChannel(id).then (videos)=>
      _.map videos, (video)=>
        videoModel = Ember.Object.create video
        @setWatched videoModel
        videoModel

  setWatched: (video)->
    @store.find('watched_video').then (watchedVideos)=>
      video.set 'watched', _.any watchedVideos.get('content'), (watchedVideo)->
        video.get('id') is watchedVideo.get('id')
