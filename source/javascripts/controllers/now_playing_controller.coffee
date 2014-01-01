App.NowPlayingController = Ember.ObjectController.extend

  actions:

    updateNowPlayingTime: (time)->
      @set 'time', time
      @get('model').save()
