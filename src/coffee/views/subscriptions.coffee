define ['backbone', 'handlebars'
'views/subscription-search', 'collections/subscriptions'
'views/subscription'],
(Backbone, Handlebars, \
SubscriptionSearchView, subscriptions, \
SubscriptionView) ->

  class SubscriptionsView extends Backbone.View

    el: '#subscriptions-region'

    $subs: $ '#subscriptions'
    $editText: $ '.edit-subscriptions span'

    events:
      'click .edit-subscriptions' : 'editSubscriptions'

    initialize: ->
      @editingSubs = false

      new SubscriptionSearchView

      subscriptions.on 'add', @addOneSub
      subscriptions.on 'reset', @addAllSubs

      subscriptions.fetch()

    addOneSub: (sub) =>
      view = new SubscriptionView model: sub
      @$subs.append view.render().el

    addAllSubs: =>
      @$subs.html ''
      subscriptions.each @addOneSub, @

    editSubscriptions: (e) ->
      e.preventDefault()

      if @editingSubs
        @$editText.html 'Edit'
      else
        @$editText.html 'Done'

      @$subs.toggleClass 'editing'
      @editingSubs = !@editingSubs
