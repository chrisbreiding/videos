App.ApplicationController = Ember.Controller.extend

  init: ->
    @_super()
    App.NowPlaying.get().then (nowPlaying)=>
      @set('nowPlaying', nowPlaying) if nowPlaying

  actions:

    playVideo: (video)->
      App.NowPlaying.set video
      @set 'nowPlaying', video

    closeVideo: ->
      App.NowPlaying.destroy()
      @set 'nowPlaying', null
