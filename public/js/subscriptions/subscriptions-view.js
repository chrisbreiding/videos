(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'subscription-search/subscription-search-view', 'subscriptions/subscription-view', 'subscriptions/subscription-collection'], function(Backbone, SubscriptionSearchView, SubscriptionView, subscriptions) {
    var $editText, $subs, SubscriptionsView;
    $subs = $('#subscriptions');
    $editText = $('.edit-subscriptions span');
    return SubscriptionsView = (function(_super) {

      __extends(SubscriptionsView, _super);

      function SubscriptionsView() {
        this.addAll = __bind(this.addAll, this);

        this.addOne = __bind(this.addOne, this);
        return SubscriptionsView.__super__.constructor.apply(this, arguments);
      }

      SubscriptionsView.prototype.el = '#subscriptions-region';

      SubscriptionsView.prototype.events = {
        'click .edit-subscriptions': 'editSubscriptions'
      };

      SubscriptionsView.prototype.initialize = function() {
        this.editingSubs = false;
        new SubscriptionSearchView;
        subscriptions.on('add', this.addOne);
        subscriptions.on('reset', this.addAll);
        return subscriptions.fetch();
      };

      SubscriptionsView.prototype.addOne = function(sub) {
        var view;
        view = new SubscriptionView({
          model: sub
        });
        return $subs.append(view.render().el);
      };

      SubscriptionsView.prototype.addAll = function() {
        $subs.html('');
        return subscriptions.each(this.addOne, this);
      };

      SubscriptionsView.prototype.editSubscriptions = function(e) {
        e.preventDefault();
        if (this.editingSubs) {
          $editText.html('Edit');
        } else {
          $editText.html('Done');
        }
        $subs.toggleClass('editing');
        return this.editingSubs = !this.editingSubs;
      };

      return SubscriptionsView;

    })(Backbone.View);
  });

}).call(this);
