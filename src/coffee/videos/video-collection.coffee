define ['backbone', 'videos/video-model'],
(Backbone, VideoModel) ->

  class VideoCollection extends Backbone.Collection

    model: VideoModel

  new VideoCollection
