App.VideosController = Ember.ArrayController.extend

  needs: 'application'

  setVideoWatched: (video, watched)->
    video.set 'watched', watched
    if watched
      @store.createRecord('watched_video', id: video.get('id')).save()
    else
      @store.find('watched_video', video.get('id')).then (watchedVideo)->
        watchedVideo.destroyRecord()

  actions:

    playVideo: (video)->
      videos = @get 'content'
      currentPage = @get 'currentPage'
      index = videos.indexOf video
      video.setProperties
        hasPrevious: index > 0 || currentPage > 1
        hasNext: index < videos.get('length') - 1 || currentPage < @get 'totalPages'

      @setVideoWatched video, true unless video.get 'watched'
      @get('controllers.application').send 'playVideo', video

    toggleWatched: (video)->
      @setVideoWatched video, !video.get('watched')

    didSelectPage: (pageToken, callback)->
      @send 'updateVideos', pageToken, callback
