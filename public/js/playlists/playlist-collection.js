(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'playlists/playlist-model', 'services/youtube'], function(Backbone, PlaylistModel, youtube) {
    var PlaylistCollection;
    PlaylistCollection = (function(_super) {

      __extends(PlaylistCollection, _super);

      function PlaylistCollection() {
        this.show = __bind(this.show, this);

        this.load = __bind(this.load, this);
        return PlaylistCollection.__super__.constructor.apply(this, arguments);
      }

      PlaylistCollection.prototype.model = PlaylistModel;

      PlaylistCollection.prototype.fetch = function(channelId) {
        return youtube.getPlaylistsByChannel(channelId).done(this.load);
      };

      PlaylistCollection.prototype.load = function(results) {
        return _.each(results.feed.entry, this.show);
      };

      PlaylistCollection.prototype.show = function(playlist) {
        return this.add(youtube.mapPlaylistDetails(playlist));
      };

      return PlaylistCollection;

    })(Backbone.Collection);
    return new PlaylistCollection;
  });

}).call(this);
