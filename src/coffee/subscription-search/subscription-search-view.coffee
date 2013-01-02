define [
  'backbone', 'handlebars'
  'subscription-search/subscription-search-result-model'
  'subscription-search/subscription-search-result-view'
  'text!template/subscription-search.html'
  'services/youtube'
],
(Backbone, Handlebars, \
SubscriptionSearchResultModel, \
SubscriptionSearchResultView, \
subSearchTemplate, \
youtube) ->

  class SubscriptionSearchView extends Backbone.View

    el: '#subscription-search-region'

    $subSearch: $ '#subscription-search-region'
    $results: $ '#subscription-search-results'

    events:
      'click #new-subscription' : 'showSubSearch'
      'submit #sub-search-form' : 'searchSubs'
      'click #search-subs'      : 'searchSubs'

    # # #
    # Load in some search results for styling purposes
    #
    # initialize: ->
    #   @showSubSearch { preventDefault: -> }
    #   youtube.searchSubs('dog').done @showResults
    # # #

    showSubSearch: (e) ->
      e.preventDefault()
      $('#new-subscription').after subSearchTemplate
      $('#sub-query').focus()

    searchSubs: (e) ->
      e.preventDefault()
      query = $('#sub-query').val()
      youtube.searchChannels(query).done @showResults

    showResults: (results) =>
      @clearResults()
      _.each results.feed.entry, @addResult

    clearResults: ->
      @$results.html('')

    addResult: (entry) =>
      model = new SubscriptionSearchResultModel youtube.mapSubDetails(entry)
      view = new SubscriptionSearchResultView model: model

      @$results.append view.render().el
