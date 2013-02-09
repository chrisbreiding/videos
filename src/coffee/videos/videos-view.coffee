define ['backbone', 'videos/video-view', 'videos/video-collection', 'paginator/paginator-view'],
(Backbone, VideoView, videos, Paginator)->

  $videos = $ '#videos'

  class VideosView extends Backbone.View

    el: '#videos-region'

    initialize: ->
      videos.on 'add', @addOne
      videos.on 'reset', @addAll

      @paginator = new Paginator el: '#video-paginator'

    addOne: (video)=>
      view = new VideoView model: video
      $videos.append view.render().el

    addAll: =>
      $videos.html ''
      @paginator.update videos.count
      videos.each @addOne, this
