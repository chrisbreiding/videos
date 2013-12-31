App.Sub = DS.Model.extend
  title:   DS.attr 'string'
  author:  DS.attr 'string'
  thumb:   DS.attr 'string'
  default: DS.attr 'boolean'

App.SubAdapter = App.ApplicationAdapter.extend

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
      savedRecord =
        id: record.get 'id'
        title: record.get 'title'
        author: record.get 'author'
        thumb: record.get 'thumb'
        default: false
      data.records[id] = savedRecord
      App.LS.set(type, data).then -> savedRecord
