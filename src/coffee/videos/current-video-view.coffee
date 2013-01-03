define ['backbone', 'handlebars', 'text!template/current-video.html'],
(Backbone, Handlebars, template) ->

  $body = $ document.body

  class CurrentVideoView extends Backbone.View

    el: '#current-video'

    template: Handlebars.compile template

    events:
      'click .play-video': 'embed'

    initialize: ->
      @render()
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      $body.addClass 'video-open'
      @

    embed: (e) =>
      e.preventDefault()
