define ['backbone', 'handlebars'
'subscription-search/subscription-search-view'
'subscriptions/subscription-view'
'subscriptions/subscription-collection'],
(Backbone, Handlebars, \
SubscriptionSearchView, \
SubscriptionView, \
subscriptions) ->

  class SubscriptionsView extends Backbone.View

    el: '#subscriptions-region'

    $subs: $ '#subscriptions'
    $editText: $ '.edit-subscriptions span'

    events:
      'click .edit-subscriptions' : 'editSubscriptions'

    initialize: ->
      @editingSubs = false

      new SubscriptionSearchView

      subscriptions.on 'add', @addOne
      subscriptions.on 'reset', @addAll

      subscriptions.fetch()

    addOne: (sub) =>
      view = new SubscriptionView model: sub
      @$subs.append view.render().el

    addAll: =>
      @$subs.html ''
      subscriptions.each @addOne, @

    editSubscriptions: (e) ->
      e.preventDefault()

      if @editingSubs
        @$editText.html 'Edit'
      else
        @$editText.html 'Done'

      @$subs.toggleClass 'editing'
      @editingSubs = !@editingSubs
