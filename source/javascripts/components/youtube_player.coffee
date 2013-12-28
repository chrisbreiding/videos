PLAYBACK_QUALITY = 'hd720'

youtubeReady = new Ember.RSVP.Promise (resolve)->
  window.onYouTubeIframeAPIReady = -> resolve()

App.YoutubePlayerComponent = Ember.Component.extend

  classNames: ['now-playing-video']

  didInsertElement: ->
    youtubeReady.then =>
      @player = new YT.Player 'youtube-iframe',
        width: '960'
        height: '540'
        videoId: @get 'videoId'
        playerVars:
          autoplay: Number @get 'autoplay'
          start: @get('time') or 0
        events:
          onStateChange: (e)=> @playerStateChanged e

      @player.setPlaybackQuality PLAYBACK_QUALITY

  didChangeVideoId: (->
    @player.loadVideoById(@get 'videoId', 0, PLAYBACK_QUALITY);
  ).observes 'videoId'

  playerStateChanged: (e)->
    switch e.data
      when YT.PlayerState.PLAYING
        @activateTimeMonitor()
      when YT.PlayerState.PAUSED
        clearInterval @timeMonitor
      when YT.PlayerState.ENDED
        clearInterval @timeMonitor
        @resetTime

  activateTimeMonitor: ->
    @timeMonitor = setInterval =>
      @updateTime @player.getCurrentTime()
    , 1000

  updateTime: (time)->
    @sendAction 'onTimeUpdate', Math.floor(time)

  resetTime: ->
    @updateTime 0
