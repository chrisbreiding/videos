(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'services/vent', 'services/youtube', 'templates/subscription.hb', 'playlists/playlists-view'], function(Backbone, vent, youtube, template, PlaylistsView) {
    var SubscriptionView;
    return SubscriptionView = (function(_super) {

      __extends(SubscriptionView, _super);

      function SubscriptionView() {
        return SubscriptionView.__super__.constructor.apply(this, arguments);
      }

      SubscriptionView.prototype.className = 'subscription clearfix';

      SubscriptionView.prototype.template = template;

      SubscriptionView.prototype.events = {
        'click .view-subscription': 'viewVideos',
        'click .toggle-playlists': 'togglePlaylists',
        'click .delete-subscription': 'delete'
      };

      SubscriptionView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      SubscriptionView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$togglePlaylists = this.$el.find('.toggle-playlists');
        if (this.model.get('type') === 'playlist') {
          this.$togglePlaylists.hide();
        }
        return this;
      };

      SubscriptionView.prototype.viewVideos = function(e) {
        e.preventDefault();
        if (this.model.get('type') === 'channel') {
          return vent.trigger('channel:load', this.model.get('channelId'));
        } else {
          return vent.trigger('playlist:load', _.clone(this.model.attributes));
        }
      };

      SubscriptionView.prototype.togglePlaylists = function(e) {
        e.preventDefault();
        if (this.playlistsView) {
          this.playlistsView.remove();
          this.playlistsView = false;
          return this.$togglePlaylists.find('i').addClass('icon-chevron-down').removeClass('icon-chevron-up');
        } else {
          this.playlistsView = new PlaylistsView({
            channelId: this.model.get('channelId')
          });
          this.$el.append(this.playlistsView.el);
          return this.$togglePlaylists.find('i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
        }
      };

      SubscriptionView.prototype["delete"] = function(e) {
        e.preventDefault();
        return this.model.destroy();
      };

      return SubscriptionView;

    })(Backbone.View);
  });

}).call(this);
