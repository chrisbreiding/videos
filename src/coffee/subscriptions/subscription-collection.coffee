define ['backbone', 'localstorage', 'services/vent', 'subscriptions/subscription-model'],
(Backbone, Store, vent, SubscriptionModel)->

  class SubscriptionCollection extends Backbone.Collection

    model: SubscriptionModel

    localStorage: new Store 'subscriptions'

    initialize: ->
      vent.on 'subscription:add', (model)=>
        @create model

  new SubscriptionCollection
