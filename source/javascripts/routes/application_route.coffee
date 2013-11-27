App.ApplicationRoute = Ember.Route.extend

  setupController: (controller)->
    nowPlaying = localStorage.getItem 'nowPlaying'
    return unless nowPlaying
    video = JSON.parse nowPlaying
    controller.set 'video', video

  actions:
    playVideo: (video)->
      @get('controller').set 'video', video
      localStorage.setItem 'nowPlaying', JSON.stringify(video)
