define ['backbone', 'handlebars', 'services/vent', 'templates/playlist.hb'],
(Backbone, Handlebars, vent, template)->

  class PlaylistView extends Backbone.View

    className: 'playlist clearfix'

    template: template

    events:
      'click .view-playlist' : 'viewVideos'

    initialize: ->
      @model.on 'destroy', @remove, this

    render: =>
      @$el.html @template(@model.toJSON())
      this

    viewVideos: (e)->
      e.preventDefault()
      vent.trigger 'playlist:load', @model.attributes
