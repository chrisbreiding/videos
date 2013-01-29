(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'handlebars', 'services/vent', 'templates/subscription-search-result.hb'], function(Backbone, Handlebars, vent, template) {
    var SubscriptionSearchResultView;
    return SubscriptionSearchResultView = (function(_super) {

      __extends(SubscriptionSearchResultView, _super);

      function SubscriptionSearchResultView() {
        this.render = __bind(this.render, this);
        return SubscriptionSearchResultView.__super__.constructor.apply(this, arguments);
      }

      SubscriptionSearchResultView.prototype.className = 'subscription clearfix';

      SubscriptionSearchResultView.prototype.template = template;

      SubscriptionSearchResultView.prototype.events = {
        'click .add-subscription': 'addSub'
      };

      SubscriptionSearchResultView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      SubscriptionSearchResultView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      };

      SubscriptionSearchResultView.prototype.addSub = function(e) {
        e.preventDefault();
        vent.trigger('subscription:add', this.model.attributes);
        return this.model.destroy();
      };

      return SubscriptionSearchResultView;

    })(Backbone.View);
  });

}).call(this);
