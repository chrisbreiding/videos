define ['backbone', 'services/vent', 'services/youtube'
'templates/subscription.hb', 'playlists/playlists-view'],
(Backbone, vent, youtube, \
template, PlaylistsView)->

  class SubscriptionView extends Backbone.View

    className: 'subscription clearfix'

    template: template

    events:
      'click .view-subscription'   : 'viewVideos'
      'click .toggle-playlists'    : 'togglePlaylists'
      'click .delete-subscription' : 'delete'

    initialize: ->
      @model.on 'destroy', @remove, this

    render: ->
      @$el.html @template(@model.toJSON())
      @$togglePlaylists = @$el.find('.toggle-playlists')
      @$togglePlaylists.hide() if @model.get('type') is 'playlist'
      this

    viewVideos: (e)->
      e.preventDefault()
      if @model.get('type') is 'channel'
        vent.trigger 'channel:load', @model.get('channelId')
      else
        vent.trigger 'playlist:load', @model.get('playlistId')

    togglePlaylists: (e)->
      e.preventDefault()
      if @playlistsView
        @playlistsView.remove()
        @playlistsView = false
        @$togglePlaylists.find('i').addClass('icon-chevron-down').removeClass('icon-chevron-up')
      else
        @playlistsView = new PlaylistsView channelId: @model.get('channelId')
        @$el.append @playlistsView.el
        @$togglePlaylists.find('i').removeClass('icon-chevron-down').addClass('icon-chevron-up')

    delete: (e)->
      e.preventDefault()
      @model.destroy()
