(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'templates/current-video.hb'], function(Backbone, template) {
    var $body, CurrenVideoView;
    $body = $(document.body);
    return CurrenVideoView = (function(_super) {

      __extends(CurrenVideoView, _super);

      function CurrenVideoView() {
        this.embed = __bind(this.embed, this);

        this.render = __bind(this.render, this);
        return CurrenVideoView.__super__.constructor.apply(this, arguments);
      }

      CurrenVideoView.prototype.el = '#current-video';

      CurrenVideoView.prototype.template = template;

      CurrenVideoView.prototype.events = {
        'click .play-video': 'embed'
      };

      CurrenVideoView.prototype.initialize = function() {
        this.render();
        return this.model.on('destroy', this.remove, this);
      };

      CurrenVideoView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        $body.addClass('video-open');
        return this;
      };

      CurrenVideoView.prototype.embed = function(e) {
        return e.preventDefault();
      };

      return CurrenVideoView;

    })(Backbone.View);
  });

}).call(this);
