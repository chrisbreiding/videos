App.NowPlaying = Ember.Object.extend()

App.NowPlaying.reopenClass

  get: ->
    console.log 'unimplemented - NowPlaying.get'
    # App.Store.Single.find 'now_playing'

  set: (record)->
    console.log 'unimplemented - NowPlaying.set'
    # App.Store.Single.createRecord 'now_playing', record

  destroy: ->
    console.log 'unimplemented - NowPlaying.destroy'
    # App.Store.Single.deleteRecord 'now_playing'
