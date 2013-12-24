App.NowPlaying = Ember.Object.extend()

App.NowPlaying.reopenClass

  get: ->
    App.Store.find 'now_playing', 1

  set: (record)->
    App.Store.createRecordWithId 'now_playing', record, 1

  destroy: ->
    App.Store.find('now_playing', 1).then (record)->
      App.Store.deleteRecord 'now_playing', record
