App.SubController = Ember.ObjectController.extend

  needs: 'application'

  setVideoWatched: (video, watched)->
    action = if watched then 'add' else 'remove'
    App.Store.List[action] "watched_videos_#{@get('id')}", video.get('id')
    video.set 'watched', watched

  actions:

    playVideo: (video)->
      @setVideoWatched video, true
      @get('controllers.application').send 'playVideo', video

    toggleWatched: (video)->
      @setVideoWatched video, !video.get('watched')
