// Generated by CoffeeScript 1.4.0
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'handlebars', 'text!templates/subscription.html'], function(Backbone, Handlebars, subTemplate) {
    var SubscriptionView;
    return SubscriptionView = (function(_super) {

      __extends(SubscriptionView, _super);

      function SubscriptionView() {
        this.render = __bind(this.render, this);
        return SubscriptionView.__super__.constructor.apply(this, arguments);
      }

      SubscriptionView.prototype.className = 'subscription clearfix';

      SubscriptionView.prototype.template = Handlebars.compile(subTemplate);

      SubscriptionView.prototype.events = {
        'click .view-subscription': 'view',
        'click .delete-subscription': 'delete'
      };

      SubscriptionView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      SubscriptionView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      };

      SubscriptionView.prototype.view = function(e) {
        e.preventDefault();
        return console.log('view it');
      };

      SubscriptionView.prototype["delete"] = function(e) {
        e.preventDefault();
        return this.model.destroy();
      };

      return SubscriptionView;

    })(Backbone.View);
  });

}).call(this);
