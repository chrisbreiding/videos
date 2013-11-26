App.Video = DS.Model.extend
  videoId: DS.attr 'string'
  title: DS.attr 'string'
  published: DS.attr 'date'
  updated: DS.attr 'date'
  thumb: DS.attr 'string'
  duration: DS.attr 'number'
