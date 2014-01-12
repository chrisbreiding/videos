App.VideosController = Ember.ArrayController.extend

  needs: 'application'

  setVideoWatched: (video, watched)->
    video.set 'watched', watched
    if watched
      @store.createRecord('watched_video', id: video.get('id')).save()
    else
      @store.find('watched_video', video.get('id')).then (watchedVideo)->
        watchedVideo.destroyRecord()

  playVideoBefore: (nowPlayingVideo)->
    @playVideoWithIndex nowPlayingVideo, (index)-> index - 1

  playVideoAfter: (nowPlayingVideo)->
    @playVideoWithIndex nowPlayingVideo, (index)-> index + 1

  playVideoWithIndex: (nowPlayingVideo, indexTransform)->
    videos = @get 'content'
    video = videos.findBy 'id', nowPlayingVideo.get('videoId')
    @send 'playVideo', videos.objectAt(indexTransform(videos.indexOf(video)))

  actions:

    playVideo: (video)->
      videos = @get 'content'
      index = videos.indexOf video
      video.setProperties
        hasPrevious: index > 0
        hasNext: index < videos.get('length') - 1

      @setVideoWatched video, true if not video.get 'watched'
      @get('controllers.application').send 'playVideo', video

    toggleWatched: (video)->
      @setVideoWatched video, !video.get('watched')
