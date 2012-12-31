define ['backbone', 'views/subscriptions'], (Backbone, SubscriptionsView) ->

  class AppView extends Backbone.View

    el: 'body'

    initialize: ->
      new SubscriptionsView
