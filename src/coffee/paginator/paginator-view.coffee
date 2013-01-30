define ['backbone'], (Backbone)->

  class PaginatorView extends Backbone.View

    tagName: 'ul'

    className: 'paginator clearfix'

    template: template

    events:
      'click li' : 'viewPage'

    initialize: ->
      @model.on 'destroy', @remove, this

    render: =>
      this

    viewPage: ->
