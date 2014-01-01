App.SubController = Ember.ObjectController.extend

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
      @setVideoWatched video, true if not video.get 'watched'
      @get('controllers.application').send 'playVideo', video

    toggleWatched: (video)->
      @setVideoWatched video, !video.get('watched')
