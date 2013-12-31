App.WatchedVideo = DS.Model.extend()

App.WatchedVideo.reopenClass

  serialize: (record)->
    id: record.get 'id'
