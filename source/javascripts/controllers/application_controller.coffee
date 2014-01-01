App.ApplicationController = Ember.Controller.extend

  init: ->
    @_super()
    @store.find('now_playing').then (nowPlaying)=>
      if nowPlaying.get('content').length
        @playVideo nowPlaying.get('firstObject'), false

  serializedVideo: (video)->
    videoId: video.get 'id'
    title: video.get 'title'
    time: 0

  playVideo: (video, autoplay)->
    video.set 'autoplay', autoplay
    @set 'nowPlaying', video

  actions:

    playVideo: (video)->
      record = @store.createRecord 'now_playing', @serializedVideo(video)
      record.save().then (nowPlaying)=>
        @playVideo nowPlaying, true

    closeVideo: ->
      @store.find('now_playing').then (nowPlaying)=>
        nowPlaying.get('firstObject').destroyRecord()
        @set 'nowPlaying', null
