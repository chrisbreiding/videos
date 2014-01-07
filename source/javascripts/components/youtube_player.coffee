PLAYBACK_QUALITY = 'hd720'

youtubeReady = new Ember.RSVP.Promise (resolve)->
  window.onYouTubeIframeAPIReady = -> resolve()

App.YoutubePlayerComponent = Ember.Component.extend

  classNames: ['now-playing-video']

  showingInfo: false

  didInsertElement: ->
    @currentVideoId = @get 'video.videoId'

    youtubeReady.then =>
      @player = new YT.Player 'youtube-iframe',
        width: '960'
        height: '540'
        videoId: @currentVideoId
        playerVars:
          autoplay: Number @get 'autoplay'
          start: @get('video.time') or 0
        events:
          onStateChange: (e)=> @playerStateChanged e

      @player.setPlaybackQuality PLAYBACK_QUALITY
      @set 'playing', @get('autoplay')

  didChangeVideoId: (->
    videoId = @get 'video.videoId'
    if @currentVideoId isnt videoId
      @currentVideoId = videoId
      @player.loadVideoById videoId, 0, PLAYBACK_QUALITY
  ).observes 'video.videoId'

  didChangeShowingInfo: (->
    this.$('.youtube-player-info').slideToggle()
  ).observes 'showingInfo'

  hasPrevious: (->
    @get 'video.hasPrevious'
  ).property 'video.hasPrevious'

  hasNext: (->
    @get 'video.hasNext'
  ).property 'video.hasNext'

  playerStateChanged: (e)->
    switch e.data
      when YT.PlayerState.PLAYING
        @set 'playing', true
        @beginMonitoringTime()
      when YT.PlayerState.PAUSED
        @set 'playing', false
        @stopMonitoringTime()
      when YT.PlayerState.ENDED
        @set 'playing', false
        @stopMonitoringTime()
        @resetTime

  beginMonitoringTime: ->
    @timeMonitor = setInterval =>
      @updateTime @player.getCurrentTime()
    , 1000

  stopMonitoringTime: ->
    clearInterval @timeMonitor

  updateTime: (time)->
    @sendAction 'onTimeUpdate', Math.floor(time)

  resetTime: ->
    @updateTime 0

  actions:

    togglePlay: ->
      @toggleProperty 'playing'
      if @get 'playing'
        @player.playVideo()
      else
        @player.pauseVideo()

    toggleInfo: ->
      @toggleProperty 'showingInfo'

    previous: ->
      @sendAction 'onPrevious'

    next: ->
      @sendAction 'onNext'

    close: ->
      @stopMonitoringTime()
      @sendAction 'onClose'
