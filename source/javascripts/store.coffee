App.ApplicationAdapter = DS.Adapter.extend

  findAll: (store, type)->
    App.ls.get(type).then (data)->
      (record for key, record of data.records)

  find: (store, type, id)->
    App.ls.get(type).then (data)->
      data.records[id]

  createRecord: (store, type, record)->
    @_saveRecord store, type, record

  updateRecord: (store, type, record)->
    @_saveRecord store, type, record

  deleteRecord: (store, type, record)->
    id = record.get 'id'
    App.ls.get(type).then (data)->
      delete data.records[id] if data.records?[id]?
      App.ls.set(type, data).then -> record

  _saveRecord: (store, type, record)->
    id = record.get 'id'
    App.ls.get(type).then (data)->
      data.records ||= {}
      savedRecord = type.serialize record
      data.records[id] = savedRecord
      App.ls.set(type, data).then -> savedRecord
