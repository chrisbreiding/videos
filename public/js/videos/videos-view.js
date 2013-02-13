(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'videos/video-view', 'videos/video-collection', 'paginator/paginator-view'], function(Backbone, VideoView, videos, Paginator) {
    var $videos, VideosView;
    $videos = $('#videos');
    return VideosView = (function(_super) {

      __extends(VideosView, _super);

      function VideosView() {
        this.addAll = __bind(this.addAll, this);

        this.addOne = __bind(this.addOne, this);
        return VideosView.__super__.constructor.apply(this, arguments);
      }

      VideosView.prototype.el = '#videos-region';

      VideosView.prototype.collection = videos;

      VideosView.prototype.initialize = function() {
        this.collection.on('add', this.addOne);
        this.collection.on('reset', this.addAll);
        return this.paginator = new Paginator({
          el: '#video-paginator',
          collection: this.collection
        });
      };

      VideosView.prototype.addOne = function(video) {
        var view;
        view = new VideoView({
          model: video
        });
        return $videos.append(view.render().el);
      };

      VideosView.prototype.addAll = function() {
        $videos.html('');
        this.paginator.update(this.collection.count);
        return this.collection.each(this.addOne, this);
      };

      return VideosView;

    })(Backbone.View);
  });

}).call(this);
