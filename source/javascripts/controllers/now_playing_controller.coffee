App.NowPlayingController = Ember.ObjectController.extend

  needs: 'sub'

  actions:

    playPrevious: ->
      @get('controllers.sub').playVideoBefore @get('model')

    playNext: ->
      @get('controllers.sub').playVideoAfter @get('model')

    updateNowPlayingTime: (time)->
      @set 'time', time
      @get('model').save()
