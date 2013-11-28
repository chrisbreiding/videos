App.SubController = Ember.ObjectController.extend

  actions:
    toggleWatched: (video)->
      video.set 'watched', !video.get('watched')
