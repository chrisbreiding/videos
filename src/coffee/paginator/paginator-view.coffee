define ['backbone', 'templates/paginator-item.hb'], (Backbone, itemTemplate)->

  class PaginatorView extends Backbone.View

    initialize: (options)->
      @collection = options.collection
      @page = options.page or 1

    events:
      'click a': 'goToPage'

    render: =>
      pageCount = Math.floor(@count / 25)

      @$el.html (itemTemplate label: '«', to: 'previous')

      @$el.append ((itemTemplate label: i + 1, to: i + 1) for i in [0..pageCount]).join('')

      @$el.append (itemTemplate label: '»', to: 'next')

    update: (count)->
      @count = count
      @render()

    goToPage: (e)->
      to = $(e.target).data 'to'

      @page = switch to
        when 'previous' then @page - 1
        when 'next' then @page + 1
        else Number to

      @collection.loadPage @page
