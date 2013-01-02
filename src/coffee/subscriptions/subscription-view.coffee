define ['backbone', 'handlebars', 'services/vent'
'text!template/subscription.html'],
(Backbone, Handlebars, vent, \
subTemplate) ->

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
      vent.trigger 'subscription:load', @model.get('channelId')

    delete: (e) ->
      e.preventDefault()
      @model.destroy()
