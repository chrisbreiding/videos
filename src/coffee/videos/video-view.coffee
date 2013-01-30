define ['backbone', 'templates/video.hb', 'videos/current-video-view', \
'template-helpers/date', 'template-helpers/duration'],
(Backbone, template, CurrentVideoView)->

  class VideoView extends Backbone.View

    className: 'video clearfix'

    template: template

    events:
      'click .play-video': 'embed'

    initialize: ->
      @model.on 'destroy', @remove, this

    render: =>
      @$el.html @template(@model.toJSON())
      this

    embed: (e)=>
      e.preventDefault()
      new CurrentVideoView model: @model
