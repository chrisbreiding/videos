define ['backbone', 'localstorage', 'services/vent'
'subscriptions/subscription-model'],
(Backbone, Store, vent, \
SubscriptionModel) ->

  class SubscriptionsCollection extends Backbone.Collection

    model: SubscriptionModel

    localStorage: new Store 'subscriptions'

    initialize: ->
      vent.on 'subscription:add', (modelAttrs) =>
        @create modelAttrs

  new SubscriptionsCollection
