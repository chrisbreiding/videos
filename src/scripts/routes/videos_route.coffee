App.VideosRoute = Ember.Route.extend

  model: ->
    @getVideosForPage().then (result)-> result.videos

  setupController: (controller, model)->
    controller.set 'model', model
    controller.set 'prevPageToken', @store.metadataFor('video').prevPageToken
    controller.set 'nextPageToken', @store.metadataFor('video').nextPageToken

  setWatched: (video)->
    @store.find('watched_video').then (watchedVideos)=>
      video.set 'watched', _.any watchedVideos.get('content'), (watchedVideo)->
        video.get('id') is watchedVideo.get('id')

  getVideosForPage: (pageToken)->
    id = @modelFor('sub').get 'id'
    App.youTube.getVideosByPlaylistId(id, pageToken).then (result)=>
      @store.metaForType 'video',
        prevPageToken: result.prevPageToken
        nextPageToken: result.nextPageToken

      prevPageToken: result.prevPageToken
      nextPageToken: result.nextPageToken
      videos: _.map result.videos, (video)=>
        videoModel = Ember.Object.create video
        @setWatched videoModel
        videoModel

  actions:

    updateVideos: (pageToken, callback)->
      @getVideosForPage(pageToken).then (result)=>
        @set 'controller.model', result.videos
        @set 'controller.prevPageToken', result.prevPageToken
        @set 'controller.nextPageToken', result.nextPageToken
        callback() if callback
