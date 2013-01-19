(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'handlebars', 'playlists/playlist-view', 'playlists/playlist-collection'], function(Backbone, Handlebars, PlaylistView, playlists) {
    var SubscriptionsView;
    return SubscriptionsView = (function(_super) {

      __extends(SubscriptionsView, _super);

      function SubscriptionsView() {
        this.addAll = __bind(this.addAll, this);

        this.addOne = __bind(this.addOne, this);
        return SubscriptionsView.__super__.constructor.apply(this, arguments);
      }

      SubscriptionsView.prototype.className = 'playlists';

      SubscriptionsView.prototype.initialize = function() {
        playlists.fetch(this.options.channelId);
        playlists.on('add', this.addOne);
        return playlists.on('reset', this.addAll);
      };

      SubscriptionsView.prototype.addOne = function(sub) {
        var view;
        view = new PlaylistView({
          model: sub
        });
        return this.$el.append(view.render().el);
      };

      SubscriptionsView.prototype.addAll = function() {
        return playlists.each(this.addOne, this);
      };

      return SubscriptionsView;

    })(Backbone.View);
  });

}).call(this);
