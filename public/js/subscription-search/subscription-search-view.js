(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'templates/subscription-search.hb', 'services/youtube', 'subscription-search/subscription-search-result-model', 'subscription-search/subscription-search-result-view'], function(Backbone, template, youtube, SubscriptionSearchResultModel, SubscriptionSearchResultView) {
    var SubscriptionSearchView;
    return SubscriptionSearchView = (function(_super) {

      __extends(SubscriptionSearchView, _super);

      function SubscriptionSearchView() {
        this.addResult = __bind(this.addResult, this);

        this.showResults = __bind(this.showResults, this);
        return SubscriptionSearchView.__super__.constructor.apply(this, arguments);
      }

      SubscriptionSearchView.prototype.el = '#subscription-search-region';

      SubscriptionSearchView.prototype.$subSearch = $('#subscription-search-region');

      SubscriptionSearchView.prototype.$results = $('#subscription-search-results');

      SubscriptionSearchView.prototype.events = {
        'click #new-subscription': 'showSubSearch',
        'submit #sub-search-form': 'searchSubs',
        'click #search-subs': 'searchSubs'
      };

      SubscriptionSearchView.prototype.showSubSearch = function(e) {
        e.preventDefault();
        $('#new-subscription').after(template);
        return $('#sub-query').focus();
      };

      SubscriptionSearchView.prototype.searchSubs = function(e) {
        var query;
        e.preventDefault();
        query = $('#sub-query').val();
        return youtube.searchChannels(query).done(this.showResults);
      };

      SubscriptionSearchView.prototype.showResults = function(results) {
        this.clearResults();
        return _.each(results.feed.entry, this.addResult);
      };

      SubscriptionSearchView.prototype.clearResults = function() {
        return this.$results.html('');
      };

      SubscriptionSearchView.prototype.addResult = function(entry) {
        var model, view;
        model = new SubscriptionSearchResultModel(youtube.mapChannelDetails(entry));
        view = new SubscriptionSearchResultView({
          model: model
        });
        return this.$results.append(view.render().el);
      };

      return SubscriptionSearchView;

    })(Backbone.View);
  });

}).call(this);
