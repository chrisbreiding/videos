define ['backbone', 'underscore', 'templates/video.hb', 'videos/current-video-view', \
'template-helpers/date', 'template-helpers/duration'],
(Backbone, _, template, CurrentVideoView)->

  class VideoView extends Backbone.View

    className: 'video clearfix'

    template: template

    events:
      'click .play-video'     : 'playVideo'
      'click .mark-watched'   : 'markWatched'
      'click .mark-unwatched' : 'markUnwatched'

    initialize: ->
      @model.on 'destroy', @remove, this

    render: =>
      @$el.html @template(@model.toJSON())
      @$markWatched = @$el.find('.mark-watched')
      @$markUnwatched = @$el.find('.mark-unwatched')
      if _.contains(@model.collection.watchedVideos, @model.get 'videoId')
        @markWatched()
      else
        @markUnwatched()
      this

    playVideo: (e)=>
      e.preventDefault()
      @markWatched()
      new CurrentVideoView model: @model

    markWatched: (e)=>
      e and e.preventDefault()
      @model.collection.addWatched @model.get('videoId')
      @$markWatched.hide()
      @$markUnwatched.show()
      @$el.addClass 'watched'

    markUnwatched: (e)=>
      e and e.preventDefault()
      @model.collection.removeWatched @model.get('videoId')
      @$markWatched.show()
      @$markUnwatched.hide()
      @$el.removeClass 'watched'
