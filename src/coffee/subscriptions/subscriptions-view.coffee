define ['backbone', 'channels/channels-view', \
'subscriptions/subscription-view', 'subscriptions/subscription-collection'],
(Backbone, ChannelsView, \
SubscriptionView, subscriptions)->

  $subs = $ '#subscriptions'
  $editText = $ '.edit-subscriptions span'

  class SubscriptionsView extends Backbone.View

    el: '#subscriptions-region'

    events:
      'click .edit-subscriptions' : 'editSubscriptions'

    initialize: ->
      @editingSubs = false

      new ChannelsView

      subscriptions.on 'add', @addOne
      subscriptions.on 'reset', @addAll

      subscriptions.fetch()

    addOne: (sub)=>
      view = new SubscriptionView model: sub
      $subs.append view.render().el

    addAll: =>
      $subs.html ''
      subscriptions.each @addOne, this

    editSubscriptions: (e)->
      e.preventDefault()

      $editText.html(if @editingSubs then 'Edit' else 'Done')
      $subs.toggleClass 'editing'
      @editingSubs = !@editingSubs
