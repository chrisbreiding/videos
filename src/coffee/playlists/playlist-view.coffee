define ['backbone', 'handlebars', 'services/vent', 'text!template/playlist.html'],
(Backbone, Handlebars, vent, template) ->

  class PlaylistView extends Backbone.View

    className: 'playlist clearfix'

    template: Handlebars.compile template

    events:
      'click .view-playlist' : 'viewVideos'

    initialize: ->
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @

    viewVideos: (e) ->
      e.preventDefault()
      vent.trigger 'playlist:load', @model.attributes
