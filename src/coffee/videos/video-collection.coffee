define ['backbone', 'underscore', 'services/vent'
'services/youtube', 'videos/video-model'],
(Backbone, _, vent, \
youtube, VideoModel) ->

  class VideoCollection extends Backbone.Collection

    model: VideoModel

    initialize: ->
      vent.on 'subscription:load', (channelId) =>
        youtube.getVideosByChannel(channelId).done @loadVideos

    loadVideos: (results) =>
      @reset()
      _.each results.feed.entry, @addVideo

    addVideo: (video) =>
      @add youtube.mapVideoDetails(video)

  new VideoCollection
