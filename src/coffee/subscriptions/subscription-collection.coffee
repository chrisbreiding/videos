define ['backbone', 'localstorage', 'subscriptions/subscription-model'],
(Backbone, Store, SubscriptionModel) ->

  class SubscriptionsCollection extends Backbone.Collection

    model: SubscriptionModel

    localStorage: new Store 'subscriptions'

    initialize: ->
      require ['app/app-router'], (app) =>
        app.on 'subscription:add', (modelAttrs) =>
          @create modelAttrs

  new SubscriptionsCollection
