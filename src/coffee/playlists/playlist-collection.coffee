define ['backbone', 'playlists/playlist-model', 'services/youtube'],
(Backbone, PlaylistModel, youtube) ->

  class PlaylistCollection extends Backbone.Collection

    model: PlaylistModel

    fetch: (channelId) ->
      youtube.getPlaylistsByChannel(channelId).done @load

    load: (results) =>
      _.each results.feed.entry, @show

    show: (playlist) =>
      @add youtube.mapPlaylistDetails playlist

  new PlaylistCollection
