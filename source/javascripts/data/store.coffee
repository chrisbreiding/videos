App.ApplicationAdapter = DS.Adapter.extend

  findAll: (store, type)->
    App.ls.fetch(type).then (data)->
      _.values data.records

  find: (store, type, id)->
    App.ls.fetch(type).then (data)->
      data.records[id]

  findQuery: (store, type, query)->
    App.ls.fetch(type).then (data)->
      found = _.findWhere(data.records, query)
      if found then [found] else []

  createRecord: (store, type, record)->
    @_saveRecord store, type, record

  updateRecord: (store, type, record)->
    @_saveRecord store, type, record

  deleteRecord: (store, type, record)->
    id = record.get 'id'
    App.ls.fetch(type).then (data)->
      delete data.records[id] if data.records?[id]?
      App.ls.save(type, data).then -> type.serialize record

  _saveRecord: (store, type, record)->
    id = record.get 'id'
    App.ls.fetch(type).then (data)->
      data.records ||= {}
      savedRecord = type.serialize record
      data.records[id] = savedRecord
      App.ls.save(type, data).then -> savedRecord
