define ['backbone', 'services/vent', 'services/youtube'
'templates/subscription.hb', 'playlists/playlists-view'],
(Backbone, vent, youtube, \
template, PlaylistsView)->

  class SubscriptionView extends Backbone.View

    className: 'subscription clearfix'

    template: template

    events:
      'click .view-subscription'   : 'viewVideos'
      'click .view-playlists'      : 'viewPlaylists'
      'click .delete-subscription' : 'delete'

    initialize: ->
      @model.on 'destroy', @remove, this

    render: ->
      @$el.html @template(@model.toJSON())
      this

    viewVideos: (e)->
      e.preventDefault()
      vent.trigger 'channel:load', @model.get('channelId')

    viewPlaylists: (e)->
      e.preventDefault()
      view = new PlaylistsView channelId: @model.get('channelId')
      @$el.append view.el

    delete: (e)->
      e.preventDefault()
      @model.destroy()
