define ['backbone', 'templates/paginator-item.hb'], (Backbone, itemTemplate)->

  class PaginatorView extends Backbone.View

    render: =>
      pageCount = Math.floor(@count / 25)

      @$el.html (itemTemplate label: '«')

      @$el.append ((itemTemplate label: i + 1) for i in [0..pageCount]).join('')

      @$el.append (itemTemplate label: '»')

    update: (count)->
      @count = count
      @render()

    viewPage: ->
