App.ItemPaginatorComponent = Ember.Component.extend

  tagName: 'ul'

  classNames: ['paginator']

  classNameBindings: ['noPaging']

  noPaging: Ember.computed.lte 'totalPages', 1

  hasPrevious: (->
    @get('currentPage') > 1
  ).property 'currentPage'

  hasNext: (->
    @get('currentPage') < @get('totalPages')
  ).property 'currentPage', 'totalPages'

  pages: (->
    total = @get 'totalPages'
    current = @get 'currentPage'
    leadingEllipsis = []
    trailingEllipsis = []

    if total <= 7
      first = 2
      last = max = total - 1
    else
      min = 2
      max = total - 1

      aboveMin = (current - 2) > min
      belowMax = (current + 2) < max

      first = if aboveMin then current - 2 else min
      last = if belowMax then current + 2 else max

      first = max - 4 if last is max
      last = min + 4 if first is min

      leadingEllipsis = ['ellipsis'] if aboveMin
      trailingEllipsis = ['ellipsis'] if belowMax

    pageNumbers = [1]
                    .concat(leadingEllipsis)
                    .concat(_.range(first, last + 1))
                    .concat(trailingEllipsis)
                    .concat [max + 1]
    _.map pageNumbers, (num)=>
      label: num
      current: num is current
      ellipsis: num is 'ellipsis'
  ).property 'currentPage', 'totalPages'

  actions:

    previousPage: ->
      if @get 'hasPrevious'
        @send 'selectPage', label: @get('currentPage') - 1

    selectPage: (page)->
      unless page.current or page.ellipsis
        @sendAction 'onPageSelect', page.label

    nextPage: ->
      if @get 'hasNext'
        @send 'selectPage', label: @get('currentPage') + 1
