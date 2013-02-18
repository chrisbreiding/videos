define ['backbone', 'videos/video-view', 'videos/video-collection'],
(Backbone, VideoView, videos)->

  $videos = $ '#videos'

  class VideosView extends Backbone.View

    el: '#videos-region'

    collection: videos

    initialize: ->
      @collection.on 'add', @addOne
      @collection.on 'reset', @addAll

    addOne: (video)=>
      view = new VideoView model: video
      $videos.append view.render().el

    addAll: =>
      $videos.html ''
      @collection.each @addOne, this
