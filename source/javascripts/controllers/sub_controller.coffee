App.SubController = Ember.ObjectController.extend

  actions:
    playVideo: (video)->
      @transitionToRoute 'video', video
