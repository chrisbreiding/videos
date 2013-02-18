define ['backbone', 'underscore', 'services/vent', 'services/youtube', \
'services/local-storage', 'videos/video-model', 'paginator/paginator-view'],
(Backbone, _, vent, youtube, \
ls, VideoModel, PaginatorView)->

  class VideoCollection extends Backbone.Collection

    model: VideoModel

    initialize: ->
      vent.on 'channel:load', (channelId, page)=>
        @type = 'channel'
        @subId = channelId
        youtube.getVideosByChannel(channelId, page or 1).done @loadVideos

      vent.on 'playlist:load', (playlistId, page)=>
        @type = 'playlist'
        @subId = playlistId
        youtube.getVideosByPlaylist(playlistId, page or 1).done @loadVideos

      @paginator = new PaginatorView
        el: '#video-paginator'
        collection: this

    loadVideos: (results)=>
      @watchedVideos = ls.get('watchedVideos') || []
      @count = youtube.getVideoCount results
      @reset (youtube.mapVideoDetails(video, @type) for video in results.feed.entry)
      @paginator.update @count

    loadPage: (page)->
      vent.trigger "#{@type}:load", @subId, page

    addWatched: (id)->
      @watchedVideos.push id
      ls.set 'watchedVideos', @watchedVideos

    removeWatched: (id)->
      @watchedVideos = _.reject(@watchedVideos, (watchedId)-> id is watchedId)
      ls.set 'watchedVideos', @watchedVideos

  new VideoCollection
