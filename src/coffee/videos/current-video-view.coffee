define ['backbone', 'handlebars', 'templates/current-video.hb'],
(Backbone, Handlebars, template)->

  $body = $ document.body

  class CurrentVideoView extends Backbone.View

    el: '#current-video'

    template: template

    events:
      'click .play-video': 'embed'

    initialize: ->
      @render()
      @model.on 'destroy', @remove, this

    render: =>
      @$el.html @template(@model.toJSON())
      $body.addClass 'video-open'
      this

    embed: (e)=>
      e.preventDefault()
