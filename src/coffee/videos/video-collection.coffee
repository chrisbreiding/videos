define ['backbone', 'underscore', 'services/vent', 'services/youtube', 'services/local-storage', 'videos/video-model'],
(Backbone, _, vent, youtube, ls, VideoModel)->

  class VideoCollection extends Backbone.Collection

    model: VideoModel

    initialize: ->
      vent.on 'channel:load', (channelId)=>
        @type = 'channel'
        @subId = channelId
        youtube.getVideosByChannel(channelId).done @loadVideos

      vent.on 'playlist:load', (playlist)=>
        @type = 'playlist'
        @subId = playlist.playlistId
        youtube.getVideosByPlaylist(playlist).done @loadVideos

    comparator: (a, b)->
      Date.parse(b.get 'published') - Date.parse(a.get 'published')

    loadVideos: (results)=>
      @watchedVideos = ls.get('watchedVideos') || []
      @count = youtube.getVideoCount results
      @reset (youtube.mapVideoDetails(video, @type) for video in results.feed.entry)

    addWatched: (id)->
      @watchedVideos.push id
      ls.set 'watchedVideos', @watchedVideos

    removeWatched: (id)->
      ls.set 'watchedVideos', _.reject(@watchedVideos, (watchedId)-> id is watchedId)

  new VideoCollection
