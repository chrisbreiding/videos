App.Video = DS.Model.extend
  title: DS.attr 'string'
  description: DS.attr 'string'
  published: DS.attr 'date'
  updated: DS.attr 'date'
  thumb: DS.attr 'string'
  duration: DS.attr 'number'

App.Video.reopenClass

  serialize: (record)->
    id: record.get 'id'
    title: record.get 'title'
    description: record.get 'description'
    published: record.get 'published'
    updated: record.get 'updated'
    thumb: record.get 'thumb'
    duration: record.get 'duration'
