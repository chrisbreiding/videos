define ['backbone', 'templates/current-video.hb'],
(Backbone, template)->

  $body = $ document.body

  class CurrenVideoView extends Backbone.View

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
