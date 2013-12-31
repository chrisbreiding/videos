App.ApplicationController = Ember.Controller.extend

  init: ->
    @_super()
    console.log 'unimplemented - ApplicationController#init'
    # App.NowPlaying.get().then (nowPlaying)=>
    #   if nowPlaying
    #     @playVideo nowPlaying, false

  playVideo: (video, autoplay)->
    video.autoplay = autoplay
    @set 'nowPlaying', video

  actions:

    playVideo: (video)->
      console.log 'incomplete implementation - ApplicationController#playVideo'
      # App.NowPlaying.set video
      @playVideo video, true

    closeVideo: ->
      console.log 'incomplete implementation - ApplicationController#destroy'
      # App.NowPlaying.destroy()
      @set 'nowPlaying', null
