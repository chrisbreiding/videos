define ['backbone', 'handlebars', 'text!templates/subscription.html'],
(Backbone, Handlebars, subTemplate) ->

  class SubscriptionView extends Backbone.View

    className: 'subscription clearfix'

    template: Handlebars.compile subTemplate

    events:
      'click .view-subscription'   : 'view'
      'click .delete-subscription' : 'delete'

    initialize: ->
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @

    view: (e) ->
      e.preventDefault()
      console.log 'view it'

    delete: (e) ->
      e.preventDefault()
      @model.destroy()
