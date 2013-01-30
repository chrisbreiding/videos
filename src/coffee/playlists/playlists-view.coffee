define ['backbone', 'playlists/playlist-view', 'playlists/playlist-collection'],
(Backbone, PlaylistView, playlists)->

  class PlaylistsView extends Backbone.View

    className: 'playlists'

    initialize: ->
      playlists.fetch @options.channelId

      playlists.on 'add', @addOne
      playlists.on 'reset', @addAll

    addOne: (sub)=>
      view = new PlaylistView model: sub
      @$el.append view.render().el

    addAll: =>
      playlists.each @addOne, this
