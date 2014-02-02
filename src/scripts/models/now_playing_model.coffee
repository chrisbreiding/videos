App.NowPlaying = DS.Model.extend
  videoId: DS.attr 'string'
  title: DS.attr 'string'
  description: DS.attr 'string'
  time: DS.attr 'number'
  hasPrevious: DS.attr 'boolean'
  hasNext: DS.attr 'boolean'

App.NowPlaying.reopenClass

  serialize: (record)->
    id: '1'
    videoId: record.get 'videoId'
    title: record.get 'title'
    description: record.get 'description'
    time: record.get('time') || 0
    hasPrevious: record.get 'hasPrevious'
    hasNext: record.get 'hasNext'
