App.NowPlaying = Ember.Object.extend()

App.NowPlaying.reopenClass

  get: ->
    App.Store.Single.find 'now_playing'

  set: (record)->
    App.Store.Single.createRecord 'now_playing', record

  destroy: ->
    App.Store.Single.deleteRecord 'now_playing'
