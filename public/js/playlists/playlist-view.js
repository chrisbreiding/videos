(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'services/vent', 'templates/playlist.hb'], function(Backbone, vent, template) {
    var PlaylistView;
    return PlaylistView = (function(_super) {

      __extends(PlaylistView, _super);

      function PlaylistView() {
        this.render = __bind(this.render, this);
        return PlaylistView.__super__.constructor.apply(this, arguments);
      }

      PlaylistView.prototype.className = 'playlist clearfix';

      PlaylistView.prototype.template = template;

      PlaylistView.prototype.events = {
        'click .add-subscription': 'addSub'
      };

      PlaylistView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      PlaylistView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      };

      PlaylistView.prototype.addSub = function(e) {
        var attrs;
        e.preventDefault();
        attrs = _.clone(this.model.attributes);
        attrs.type = 'playlist';
        vent.trigger('subscription:add', attrs);
        return this.model.destroy();
      };

      return PlaylistView;

    })(Backbone.View);
  });

}).call(this);
