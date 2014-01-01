App.NowPlaying = DS.Model.extend
  videoId: DS.attr 'string'
  title: DS.attr 'string'
  time: DS.attr 'number'

App.NowPlaying.reopenClass

  serialize: (record)->
    id: '1'
    videoId: record.get 'videoId'
    title: record.get 'title'
    time: record.get('time') || 0

App.NowPlayingAdapter = App.ApplicationAdapter.extend

  findAll: (store, type, id)->
    App.ls.get(type).then (data)->
      unless Object.keys(data).length
        data = []
      data

  createRecord: (store, type, record)->
    @_saveRecord store, type, record

  updateRecord: (store, type, record)->
    @_saveRecord store, type, record

  deleteRecord: (store, type, record)->
    App.ls.set(type, []).then -> type.serialize record

  _saveRecord: (store, type, record)->
    savedRecord = type.serialize record
    App.ls.set(type, [savedRecord]).then -> savedRecord
