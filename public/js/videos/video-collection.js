(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'underscore', 'services/vent', 'services/youtube', 'services/local-storage', 'videos/video-model'], function(Backbone, _, vent, youtube, ls, VideoModel) {
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
        vent.on('channel:load', function(channelId) {
          _this.type = 'channel';
          _this.subId = channelId;
          return youtube.getVideosByChannel(channelId).done(_this.loadVideos);
        });
        return vent.on('playlist:load', function(playlist) {
          _this.type = 'playlist';
          _this.subId = playlist.playlistId;
          return youtube.getVideosByPlaylist(playlist).done(_this.loadVideos);
        });
      };

      VideoCollection.prototype.comparator = function(a, b) {
        return Date.parse(b.get('published')) - Date.parse(a.get('published'));
      };

      VideoCollection.prototype.loadVideos = function(results) {
        var video;
        this.watchedVideos = ls.get('watchedVideos') || [];
        this.count = youtube.getVideoCount(results);
        return this.reset((function() {
          var _i, _len, _ref, _results;
          _ref = results.feed.entry;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            video = _ref[_i];
            _results.push(youtube.mapVideoDetails(video, this.type));
          }
          return _results;
        }).call(this));
      };

      VideoCollection.prototype.loadPage = function(page) {
        return console.log("load page #" + page);
      };

      VideoCollection.prototype.addWatched = function(id) {
        this.watchedVideos.push(id);
        return ls.set('watchedVideos', this.watchedVideos);
      };

      VideoCollection.prototype.removeWatched = function(id) {
        return ls.set('watchedVideos', _.reject(this.watchedVideos, function(watchedId) {
          return id === watchedId;
        }));
      };

      return VideoCollection;

    })(Backbone.Collection);
    return new VideoCollection;
  });

}).call(this);
