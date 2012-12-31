define ['backbone', 'localstorage', 'models/subscription'],
(Backbone, Store, SubscriptionModel) ->

  class SubscriptionsCollection extends Backbone.Collection

    model: SubscriptionModel

    localStorage: new Store 'subscriptions'

    initialize: ->
      require ['app'], (app) =>
        app.on 'subscription:add', (modelAttrs) =>
          @create modelAttrs

  new SubscriptionsCollection
