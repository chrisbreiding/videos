App.VideosRoute = Ember.Route.extend

  model: ->
    @getVideosForPage()

  setupController: (controller, model)->
    controller.set 'model', model
    controller.set 'totalPages', @store.metadataFor('video').totalPages

  setWatched: (video)->
    @store.find('watched_video').then (watchedVideos)=>
      video.set 'watched', _.any watchedVideos.get('content'), (watchedVideo)->
        video.get('id') is watchedVideo.get('id')

  getVideosForPage: (page = 1)->
    id = @modelFor('sub').get 'id'
    App.youTube.getVideosByChannel(id, page).then (result)=>
      @store.metaForType 'video', totalPages: result.totalPages
      _.map result.videos, (video)=>
        videoModel = Ember.Object.create video
        @setWatched videoModel
        videoModel

  actions:

    updateVideos: (page, callback)->
      @getVideosForPage(page).then (videos)=>
        @set 'controller.model', videos
        callback() if callback
