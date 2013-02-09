(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'underscore', 'templates/video.hb', 'videos/current-video-view', 'template-helpers/date', 'template-helpers/duration'], function(Backbone, _, template, CurrentVideoView) {
    var VideoView;
    return VideoView = (function(_super) {

      __extends(VideoView, _super);

      function VideoView() {
        this.markUnwatched = __bind(this.markUnwatched, this);

        this.markWatched = __bind(this.markWatched, this);

        this.playVideo = __bind(this.playVideo, this);

        this.render = __bind(this.render, this);
        return VideoView.__super__.constructor.apply(this, arguments);
      }

      VideoView.prototype.className = 'video clearfix';

      VideoView.prototype.template = template;

      VideoView.prototype.events = {
        'click .play-video': 'playVideo',
        'click .mark-watched': 'markWatched',
        'click .mark-unwatched': 'markUnwatched'
      };

      VideoView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      VideoView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$markWatched = this.$el.find('.mark-watched');
        this.$markUnwatched = this.$el.find('.mark-unwatched');
        if (_.contains(this.model.collection.watchedVideos, this.model.get('videoId'))) {
          this.markWatched();
        } else {
          this.markUnwatched();
        }
        return this;
      };

      VideoView.prototype.playVideo = function(e) {
        e.preventDefault();
        this.markWatched();
        return new CurrentVideoView({
          model: this.model
        });
      };

      VideoView.prototype.markWatched = function(e) {
        e && e.preventDefault();
        this.model.collection.addWatched(this.model.get('videoId'));
        this.$markWatched.hide();
        this.$markUnwatched.show();
        return this.$el.addClass('watched');
      };

      VideoView.prototype.markUnwatched = function(e) {
        e && e.preventDefault();
        this.model.collection.removeWatched(this.model.get('videoId'));
        this.$markWatched.show();
        this.$markUnwatched.hide();
        return this.$el.removeClass('watched');
      };

      return VideoView;

    })(Backbone.View);
  });

}).call(this);
