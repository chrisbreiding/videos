PLAYBACK_QUALITY = 'hd720'

youtubePromise = new Ember.RSVP.Promise (resolve)->
  window.onYouTubeIframeAPIReady = -> resolve()

App.YoutubePlayerComponent = Ember.Component.extend

  classNames: ['now-playing-video']

  didInsertElement: ->
    youtubePromise.then =>
      @player = new YT.Player 'youtube-iframe',
        width: '960'
        height: '540'
        videoId: @get 'videoId'
        playerVars:
          autoplay: Number @get 'autoplay'
          start: 0
      @player.setPlaybackQuality PLAYBACK_QUALITY

  didChangeVideoId: (->
    @player.loadVideoById(@get 'videoId', 0, PLAYBACK_QUALITY);
  ).observes 'videoId'
