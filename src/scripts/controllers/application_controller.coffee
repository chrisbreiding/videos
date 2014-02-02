App.ApplicationController = Ember.Controller.extend

  init: ->
    @_super()
    @getNowPlaying().then (nowPlaying)=>
      @setNowPlaying nowPlaying, false if nowPlaying

  serializedVideo: (video, includeId)->
    video =
      videoId: video.get 'id'
      title: video.get 'title'
      description: video.get 'description'
      time: 0
      hasPrevious: video.get 'hasPrevious'
      hasNext: video.get 'hasNext'
    video.id = '1' if includeId
    video

  getNowPlaying: ->
    @store.find('now_playing').then (nowPlaying)=>
      if nowPlaying.get('content').length
        nowPlaying.get 'firstObject'
      else
        null

  setNowPlaying: (video, autoplay)->
    video.set 'autoplay', autoplay
    @set 'nowPlaying', video

  actions:

    playVideo: (video)->
      @getNowPlaying().then (nowPlaying)=>
        if nowPlaying
          nowPlaying.setProperties @serializedVideo(video, false)
          record = nowPlaying
        else
          record = @store.createRecord 'now_playing', @serializedVideo(video, true)

        record.save().then (nowPlaying)=>
          @setNowPlaying nowPlaying, true

    closeVideo: ->
      @getNowPlaying().then (nowPlaying)=>
        nowPlaying.destroyRecord()
        @set 'nowPlaying', null
