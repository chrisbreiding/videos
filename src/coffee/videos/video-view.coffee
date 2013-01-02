define ['backbone', 'handlebars', 'text!template/video.html'
'template-helpers/date', 'template-helpers/duration'],
(Backbone, Handlebars, videoTemplate) ->

  class VideoView extends Backbone.View

    className: 'video clearfix'

    template: Handlebars.compile videoTemplate

    initialize: ->
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @
