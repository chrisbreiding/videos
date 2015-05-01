App.ItemPaginatorComponent = Ember.Component.extend

  tagName: 'ul'

  classNames: ['paginator']

  classNameBindings: ['noPaging']

  noPaging: (->
    !@get('prevToken')? and !@get('nextToken')?
  ).property 'prevToken', 'nextToken'

  hasPrevious: (->
    @get('prevToken')?
  ).property 'prevToken'

  hasNext: (->
    @get('nextToken')?
  ).property 'nextToken'

  actions:

    previousPage: ->
      if @get 'hasPrevious'
        @sendAction 'onSelect', @get('prevToken')

    nextPage: ->
      if @get 'hasNext'
        @sendAction 'onSelect', @get('nextToken')
