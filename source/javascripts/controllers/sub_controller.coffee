App.SubController = Ember.ObjectController.extend

  actions:
    playVideo: (video)->
      console.log 'play video', video
