define ['backbone', 'subscriptions/subscriptions-view', 'videos/videos-view'],
(Backbone, SubscriptionsView, VideosView) ->

  class AppView extends Backbone.View

    el: 'body'

    initialize: ->
      new SubscriptionsView
      new VideosView
