define ['backbone', 'handlebars', 'services/vent'
'text!template/subscription-search-result.html'],
(Backbone, Handlebars, vent, \
subSearchResultsTemplate) ->

  class SubscriptionSearchResultView extends Backbone.View

    className: 'subscription clearfix'

    template: Handlebars.compile subSearchResultsTemplate

    events:
      'click .add-subscription' : 'addSub'

    initialize: ->
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @

    addSub: (e) ->
      e.preventDefault()
      vent.trigger 'subscription:add', @model.attributes
      @model.destroy()
