define ['backbone', 'services/vent', 'templates/channel.hb'],
(Backbone, vent, template)->

  class ChannelView extends Backbone.View

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
      attrs = _.clone @model.attributes
      attrs.type = 'channel'
      vent.trigger 'subscription:add', attrs
      @model.destroy()
