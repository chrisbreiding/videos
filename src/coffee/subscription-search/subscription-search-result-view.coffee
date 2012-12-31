define ['backbone', 'handlebars'
'text!templates/subscription-search-result.html'],
(Backbone, Handlebars, \
subSearchResultsTemplate) ->

  class SubscriptionSearchResultView extends Backbone.View

    className: 'subscription clearfix'

    template: Handlebars.compile subSearchResultsTemplate

    events:
      'click .add-subscription' : 'addSub'

    initialize: ->
      # @model.on 'change', @render
      @model.on 'destroy', @remove, @

    render: =>
      @$el.html @template(@model.toJSON())
      @

    addSub: (e) ->
      e.preventDefault()
      require ['app/app-router'], (app) =>
        app.trigger 'subscription:add', @model.attributes
        @model.destroy()
