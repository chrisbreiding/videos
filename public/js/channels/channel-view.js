(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'services/vent', 'templates/channel.hb'], function(Backbone, vent, template) {
    var ChannelView;
    return ChannelView = (function(_super) {

      __extends(ChannelView, _super);

      function ChannelView() {
        this.render = __bind(this.render, this);
        return ChannelView.__super__.constructor.apply(this, arguments);
      }

      ChannelView.prototype.className = 'subscription clearfix';

      ChannelView.prototype.template = template;

      ChannelView.prototype.events = {
        'click .add-subscription': 'addSub'
      };

      ChannelView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      ChannelView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      };

      ChannelView.prototype.addSub = function(e) {
        var attrs;
        e.preventDefault();
        attrs = _.clone(this.model.attributes);
        attrs.type = 'channel';
        vent.trigger('subscription:add', attrs);
        return this.model.destroy();
      };

      return ChannelView;

    })(Backbone.View);
  });

}).call(this);
