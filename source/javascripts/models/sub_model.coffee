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

  save: ->
    debugger

  createRecord: (store, type, record)->
    id = record.get 'id'
    App.LS.get(type).then (data)->
      data.records ||= {}
      newRecord =
        id: record.get 'id'
        title: record.get 'title'
        author: record.get 'author'
        thumb: record.get 'thumb'
        default: false
      data.records[id] = newRecord
      App.LS.set type, data
      newRecord

  deleteRecord: ->
    debugger

  destroyRecord: ->
    debugger
