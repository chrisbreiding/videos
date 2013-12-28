App.NowPlayingController = Ember.ObjectController.extend

  actions:

    updateNowPlayingTime: (time)->
      @set 'time', time
      App.NowPlaying.set @get 'model'
