(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'handlebars', 'templates/current-video.hb'], function(Backbone, Handlebars, template) {
    var $body, CurrentVideoView;
    $body = $(document.body);
    return CurrentVideoView = (function(_super) {

      __extends(CurrentVideoView, _super);

      function CurrentVideoView() {
        this.embed = __bind(this.embed, this);

        this.render = __bind(this.render, this);
        return CurrentVideoView.__super__.constructor.apply(this, arguments);
      }

      CurrentVideoView.prototype.el = '#current-video';

      CurrentVideoView.prototype.template = template;

      CurrentVideoView.prototype.events = {
        'click .play-video': 'embed'
      };

      CurrentVideoView.prototype.initialize = function() {
        this.render();
        return this.model.on('destroy', this.remove, this);
      };

      CurrentVideoView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        $body.addClass('video-open');
        return this;
      };

      CurrentVideoView.prototype.embed = function(e) {
        return e.preventDefault();
      };

      return CurrentVideoView;

    })(Backbone.View);
  });

}).call(this);
