define ['backbone', 'services/vent', 'templates/subscription-search-result.hb'],
(Backbone, vent, template)->

  class SubscriptionSearchResultView extends Backbone.View

    className: 'subscription clearfix'

    template: template

    events:
      'click .add-subscription' : 'addSub'

    initialize: ->
      @model.on 'destroy', @remove, this

    render: =>
      @$el.html @template(@model.toJSON())
      this

    addSub: (e)->
      e.preventDefault()
      vent.trigger 'subscription:add', @model.attributes
      @model.destroy()
