(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'underscore', 'services/vent', 'services/youtube', 'services/local-storage', 'videos/video-model', 'paginator/paginator-view'], function(Backbone, _, vent, youtube, ls, VideoModel, PaginatorView) {
    var VideoCollection;
    VideoCollection = (function(_super) {

      __extends(VideoCollection, _super);

      function VideoCollection() {
        this.loadVideos = __bind(this.loadVideos, this);
        return VideoCollection.__super__.constructor.apply(this, arguments);
      }

      VideoCollection.prototype.model = VideoModel;

      VideoCollection.prototype.initialize = function() {
        var _this = this;
        vent.on('channel:load', function(channelId, page) {
          _this.type = 'channel';
          _this.subId = channelId;
          return youtube.getVideosByChannel(channelId, page || 1).done(_this.loadVideos);
        });
        vent.on('playlist:load', function(playlistId, page) {
          _this.type = 'playlist';
          _this.subId = playlistId;
          return youtube.getVideosByPlaylist(playlistId, page || 1).done(_this.loadVideos);
        });
        return this.paginator = new PaginatorView({
          el: '#video-paginator',
          collection: this
        });
      };

      VideoCollection.prototype.loadVideos = function(results) {
        var video;
        this.watchedVideos = ls.get('watchedVideos') || [];
        this.count = youtube.getVideoCount(results);
        this.reset((function() {
          var _i, _len, _ref, _results;
          _ref = results.feed.entry;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            video = _ref[_i];
            _results.push(youtube.mapVideoDetails(video, this.type));
          }
          return _results;
        }).call(this));
        return this.paginator.update(this.count);
      };

      VideoCollection.prototype.loadPage = function(page) {
        return vent.trigger("" + this.type + ":load", this.subId, page);
      };

      VideoCollection.prototype.addWatched = function(id) {
        this.watchedVideos.push(id);
        return ls.set('watchedVideos', this.watchedVideos);
      };

      VideoCollection.prototype.removeWatched = function(id) {
        this.watchedVideos = _.reject(this.watchedVideos, function(watchedId) {
          return id === watchedId;
        });
        return ls.set('watchedVideos', this.watchedVideos);
      };

      return VideoCollection;

    })(Backbone.Collection);
    return new VideoCollection;
  });

}).call(this);
