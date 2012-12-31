define ['backbone', 'subscription-search/subscription-search-result-model'], (Backbone, SubscriptionSearchResultModel) ->

  class SubscriptionSearchResultCollection extends Backbone.Collection

    model: SubscriptionSearchResultModel
