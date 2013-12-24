App.SubController = Ember.ObjectController.extend

  actions:

    toggleWatched: (video)->
      watched = video.get 'watched'
      action = if watched then 'remove' else 'add'
      App.Store.List[action] "watched_videos_#{@get('id')}", video.get('videoId')
      video.set 'watched', !watched
