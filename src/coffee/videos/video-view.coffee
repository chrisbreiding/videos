define ['backbone', 'handlebars', 'text!template/video.html'
'videos/current-video-view'
'template-helpers/date', 'template-helpers/duration'],
(Backbone, Handlebars, template, \
CurrentVideoView) ->

  class VideoView extends Backbone.View

    className: 'video clearfix'

    template: Handlebars.compile template

    events:
      'click .play-video': 'embed'

    initialize: ->
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @

    embed: (e) =>
      e.preventDefault()
      new CurrentVideoView model: @model
