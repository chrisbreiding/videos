App.VideosController = Ember.ArrayController.extend

  currentPage: 1

  needs: 'application'

  setVideoWatched: (video, watched)->
    video.set 'watched', watched
    if watched
      @store.createRecord('watched_video', id: video.get('id')).save()
    else
      @store.find('watched_video', video.get('id')).then (watchedVideo)->
        watchedVideo.destroyRecord()

  playVideoBefore: (nowPlayingVideo)->
    index = @indexOfVideo nowPlayingVideo
    if index is 0
      @playVideoForPageAtIndex @get('currentPage') - 1, 24
    else
      @playVideoAtIndex index - 1

  playVideoAfter: (nowPlayingVideo)->
    index = @indexOfVideo nowPlayingVideo
    if index is 24
      @playVideoForPageAtIndex @get('currentPage') + 1, 0
    else
      @playVideoAtIndex index + 1

  indexOfVideo: (video)->
    videos = @get 'content'
    video = videos.findBy 'id', video.get('videoId')
    videos.indexOf video

  playVideoAtIndex: (index)->
    @send 'playVideo', @get('content').objectAt(index)

  playVideoForPageAtIndex:(page, index)->
    @send 'didSelectPage', page, =>
      @playVideoAtIndex index

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

    didSelectPage: (page, callback)->
      @set 'currentPage', page
      @send 'updateVideos', page, callback
