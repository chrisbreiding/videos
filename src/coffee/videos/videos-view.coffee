define ['backbone', 'videos/video-view', 'videos/video-collection', 'paginator/paginator-view'],
(Backbone, VideoView, videos, Paginator)->

  $videos = $ '#videos'

  class VideosView extends Backbone.View

    el: '#videos-region'

    collection: videos

    initialize: ->
      @collection.on 'add', @addOne
      @collection.on 'reset', @addAll

      @paginator = new Paginator
        el: '#video-paginator'
        collection: @collection

    addOne: (video)=>
      view = new VideoView model: video
      $videos.append view.render().el

    addAll: =>
      $videos.html ''
      @paginator.update @collection.count
      @collection.each @addOne, this
