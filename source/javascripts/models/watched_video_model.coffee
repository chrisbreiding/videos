App.WatchedVideo = DS.Model.extend()

App.WatchedVideoAdapter = App.ApplicationAdapter.extend

  findAll: (store, type)->
    App.LS.get(type).then (data)->
      (record for key, record of data.records)

  find: (store, type, id)->
    App.LS.get(type).then (data)->
      data.records[id]

  createRecord: (store, type, record)->
    @_saveRecord store, type, record

  updateRecord: (store, type, record)->
    @_saveRecord store, type, record

  deleteRecord: (store, type, record)->
    id = record.get 'id'
    App.LS.get(type).then (data)->
      delete data.records[id] if data.records?[id]?
      App.LS.set(type, data).then -> record

  _saveRecord: (store, type, record)->
    id = record.get 'id'
    App.LS.get(type).then (data)->
      data.records ||= {}
      savedRecord = id: record.get 'id'
      data.records[id] = savedRecord
      App.LS.set(type, data).then -> savedRecord

