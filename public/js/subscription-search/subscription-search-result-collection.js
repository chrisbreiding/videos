(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'subscription-search/subscription-search-result-model'], function(Backbone, SubscriptionSearchResultModel) {
    var SubscriptionSearchResultCollection;
    return SubscriptionSearchResultCollection = (function(_super) {

      __extends(SubscriptionSearchResultCollection, _super);

      function SubscriptionSearchResultCollection() {
        return SubscriptionSearchResultCollection.__super__.constructor.apply(this, arguments);
      }

      SubscriptionSearchResultCollection.prototype.model = SubscriptionSearchResultModel;

      return SubscriptionSearchResultCollection;

    })(Backbone.Collection);
  });

}).call(this);
