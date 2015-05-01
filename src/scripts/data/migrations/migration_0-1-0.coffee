App.migrator.registerMigration '0.1.0', ->

  oldLs = App.LS.create prefix: ''
  newLs = App.ls

  new Ember.RSVP.Promise (resolve)->
    oldLs.fetch('videos').then (data)->
      operations = []

      # subs
      if data.sub
        subs = {}
        for id, sub of data.sub.records
          subs[id] = _.pick sub, 'id', 'title', 'author', 'thumb', 'default'
        operations.push newLs.save('App.Sub', records: subs)

      # now playing
      oldNowPlaying = data.singles.now_playing
      if oldNowPlaying
        nowPlaying = _.pick oldNowPlaying, 'title', 'time'
        nowPlaying.id = '1'
        nowPlaying.videoId = oldNowPlaying.id
        operations.push newLs.save('App.NowPlaying', records: '1': nowPlaying)

      # watched videos
      if data.lists
        watchedVideoIds = []
        for key, records of data.lists
          if /watched_videos/.test key
            watchedVideoIds = watchedVideoIds.concat records
        watchedVideos = {}
        for watchedVideoId in watchedVideoIds
          watchedVideos[watchedVideoId] = id: watchedVideoId
        operations.push newLs.save('App.WatchedVideo', records: watchedVideos)

      # cleanup
      operations.push oldLs.remove('videos')

      Ember.RSVP.all(operations).then -> resolve()

###

'videos'
  sub: {
    records: {
      '<id>': { id, title, author, thumb, videos, default }
    }
  },
  singles: {
    'now_playing': { id, title, published, updated, thumb, duration, time }
  },
  lists: {
    'watched_videos_<id>': [id, id, id]
  }

    *
    *
*   *   *
  * * *
    *

'videos.App.Sub'
  records: {
    '<id>': { id, title, author, thumb, default }
  }

'videos.App.NowPlaying'
  records: {
    '1': { id ('1'), videoId, title, time }
  }

'videos.App.WatchedVideo'
  records: {
    '<id>': { id }
  }

###
