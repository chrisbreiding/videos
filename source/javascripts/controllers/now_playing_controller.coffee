App.NowPlayingController = Ember.ObjectController.extend

  needs: 'videos'

  actions:

    playPrevious: ->
      @get('controllers.videos').playVideoBefore @get('model')

    playNext: ->
      @get('controllers.videos').playVideoAfter @get('model')

    updateNowPlayingTime: (time)->
      @set 'time', time
      @get('model').save()
