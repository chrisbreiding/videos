define ['backbone', 'handlebars', 'text!templates/video.html'],
(Backbone, Handlebars, videoTemplate) ->

  class VideoView extends Backbone.View

    className: 'video clearfix'

    template: Handlebars.compile videoTemplate

    initialize: ->
      # @model.on 'change', @render
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @
