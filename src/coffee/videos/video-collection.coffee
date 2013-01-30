define ['backbone', 'underscore', 'services/vent', 'services/youtube', 'videos/video-model'],
(Backbone, _, vent, youtube, VideoModel)->

  class VideoCollection extends Backbone.Collection

    model: VideoModel

    initialize: ->
      vent.on 'channel:load', (channelId)=>
        @type = 'channel'
        youtube.getVideosByChannel(channelId).done @loadVideos

      vent.on 'playlist:load', (playlist)=>
        @type = 'playlist'
        youtube.getVideosByPlaylist(playlist).done @loadVideos

    comparator: (a, b)->
      Date.parse(b.get('published')) - Date.parse(a.get('published'))

    loadVideos: (results)=>
      @reset _.map results.feed.entry, @mapVideo

    mapVideo: (video)=>
      youtube.mapVideoDetails(video, @type)

  new VideoCollection
