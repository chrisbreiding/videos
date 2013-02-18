define ['backbone', 'services/vent', 'templates/playlist.hb'],
(Backbone, vent, template)->

  class PlaylistView extends Backbone.View

    className: 'playlist clearfix'

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
      attrs = _.clone @model.attributes
      attrs.type = 'playlist'
      vent.trigger 'subscription:add', attrs
      @model.destroy()
