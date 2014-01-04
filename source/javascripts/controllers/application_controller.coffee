App.ApplicationController = Ember.Controller.extend

  init: ->
    @_super()
    @getNowPlaying().then (nowPlaying)=>
      @playVideo nowPlaying, false if nowPlaying

  serializedVideo: (video, includeId)->
    video =
      videoId: video.get 'id'
      title: video.get 'title'
      time: 0
    video.id = '1' if includeId
    video

  playVideo: (video, autoplay)->
    video.set 'autoplay', autoplay
    @set 'nowPlaying', video

  getNowPlaying: ->
    @store.find('now_playing').then (nowPlaying)=>
      if nowPlaying.get('content').length
        nowPlaying.get 'firstObject'
      else
        null

  actions:

    playVideo: (video)->
      @getNowPlaying().then (nowPlaying)=>
        if nowPlaying
          nowPlaying.setProperties @serializedVideo(video, false)
          record = nowPlaying
        else
          record = @store.createRecord 'now_playing', @serializedVideo(video, true)

        record.save().then (nowPlaying)=>
          @playVideo nowPlaying, true

    closeVideo: ->
      @getNowPlaying().then (nowPlaying)=>
        nowPlaying.destroyRecord()
        @set 'nowPlaying', null
