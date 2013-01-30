(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'subscriptions/subscriptions-view', 'videos/videos-view'], function(Backbone, SubscriptionsView, VideosView) {
    var AppView;
    return AppView = (function(_super) {

      __extends(AppView, _super);

      function AppView() {
        return AppView.__super__.constructor.apply(this, arguments);
      }

      AppView.prototype.el = 'body';

      AppView.prototype.initialize = function() {
        new SubscriptionsView;
        return new VideosView;
      };

      return AppView;

    })(Backbone.View);
  });

}).call(this);
