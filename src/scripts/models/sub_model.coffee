App.Sub = DS.Model.extend
  title:   DS.attr 'string'
  author:  DS.attr 'string'
  thumb:   DS.attr 'string'
  default: DS.attr 'boolean'

App.Sub.reopenClass

  serialize: (record)->
    id: record.get 'id'
    title: record.get 'title'
    author: record.get 'author'
    thumb: record.get 'thumb'
    default: record.get('default') || false
