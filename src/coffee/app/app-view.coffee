define ['backbone', 'subscriptions/subscriptions-view'],
(Backbone, SubscriptionsView) ->

  class AppView extends Backbone.View

    el: 'body'

    initialize: ->
      new SubscriptionsView
