App.ApplicationRoute = Ember.Route.extend

  setupController: (controller)->
    App.NowPlaying.get().then (nowPlaying)->
      controller.set('nowPlaying', nowPlaying) if nowPlaying

  actions:

    playVideo: (video)->
      @get('controller').set 'nowPlaying', video
      App.NowPlaying.set video

    closeVideo: ->
      App.NowPlaying.destroy()
      @get('controller').set 'nowPlaying', null
