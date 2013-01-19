define ['backbone', 'handlebars', 'services/vent', 'services/youtube'
'text!template/subscription.html', 'playlists/playlists-view'],
(Backbone, Handlebars, vent, youtube, \
template, PlaylistsView) ->

  class SubscriptionView extends Backbone.View

    className: 'subscription clearfix'

    template: Handlebars.compile template

    events:
      'click .view-subscription'   : 'viewVideos'
      'click .view-playlists'      : 'viewPlaylists'
      'click .delete-subscription' : 'delete'

    initialize: ->
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @

    viewVideos: (e) ->
      e.preventDefault()
      vent.trigger 'channel:load', @model.get('channelId')

    viewPlaylists: (e) ->
      e.preventDefault()
      view = new PlaylistsView channelId: @model.get('channelId')
      @$el.append view.el

    delete: (e) ->
      e.preventDefault()
      @model.destroy()
