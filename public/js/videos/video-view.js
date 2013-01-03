(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'handlebars', 'text!template/video.html', 'videos/current-video-view', 'template-helpers/date', 'template-helpers/duration'], function(Backbone, Handlebars, template, CurrentVideoView) {
    var VideoView;
    return VideoView = (function(_super) {

      __extends(VideoView, _super);

      function VideoView() {
        this.embed = __bind(this.embed, this);

        this.render = __bind(this.render, this);
        return VideoView.__super__.constructor.apply(this, arguments);
      }

      VideoView.prototype.className = 'video clearfix';

      VideoView.prototype.template = Handlebars.compile(template);

      VideoView.prototype.events = {
        'click .play-video': 'embed'
      };

      VideoView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      VideoView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      };

      VideoView.prototype.embed = function(e) {
        e.preventDefault();
        return new CurrentVideoView({
          model: this.model
        });
      };

      return VideoView;

    })(Backbone.View);
  });

}).call(this);
