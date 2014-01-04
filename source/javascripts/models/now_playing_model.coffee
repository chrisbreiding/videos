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
