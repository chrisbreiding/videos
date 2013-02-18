define ['backbone', 'templates/paginator-item.hb'], (Backbone, itemTemplate)->

  class PaginatorView extends Backbone.View

    initialize: (options)->
      @collection = options.collection
      @page = options.page or 1

    events:
      'click a': 'goToPage'

    render: =>
      pageCount = Math.ceil(@count / 25)

      pages = [itemTemplate label: '«', to: 'previous']
      pages.push(itemTemplate label: i, to: i) for i in [1..pageCount]
      pages.push(itemTemplate label: '»', to: 'next')

      @$el.html pages.join('')

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
