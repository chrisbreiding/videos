(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'localstorage', 'services/vent', 'subscriptions/subscription-model'], function(Backbone, Store, vent, SubscriptionModel) {
    var SubscriptionCollection;
    SubscriptionCollection = (function(_super) {

      __extends(SubscriptionCollection, _super);

      function SubscriptionCollection() {
        return SubscriptionCollection.__super__.constructor.apply(this, arguments);
      }

      SubscriptionCollection.prototype.model = SubscriptionModel;

      SubscriptionCollection.prototype.localStorage = new Store('subscriptions');

      SubscriptionCollection.prototype.initialize = function() {
        var _this = this;
        return vent.on('subscription:add', function(model) {
          return _this.create(model);
        });
      };

      return SubscriptionCollection;

    })(Backbone.Collection);
    return new SubscriptionCollection;
  });

}).call(this);
