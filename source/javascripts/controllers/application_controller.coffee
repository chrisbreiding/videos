App.ApplicationController = Ember.Controller.extend

  init: ->
    @_super()
    App.NowPlaying.get().then (nowPlaying)=>
      if nowPlaying
        @playVideo nowPlaying, false

  playVideo: (video, autoplay)->
    video.autoplay = autoplay
    @set 'nowPlaying', video

  actions:

    playVideo: (video)->
      App.NowPlaying.set video
      @playVideo video, true

    closeVideo: ->
      App.NowPlaying.destroy()
      @set 'nowPlaying', null
