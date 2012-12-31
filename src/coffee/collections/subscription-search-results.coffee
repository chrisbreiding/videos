define ['backbone', 'models/subscription-search-result'], (Backbone, SubscriptionSearchResult) ->

  class SubscriptionSearchResultCollection extends Backbone.Collection
    model: SubscriptionSearchResult
