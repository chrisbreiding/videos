define [
  'backbone', 'handlebars'
  'models/subscription-search-result'
  'views/subscription-search-result'
  'text!templates/subscription-search.html'
  'modules/youtube'
],
(Backbone, Handlebars, \
SubscriptionSearchResultModel, \
SubscriptionSearchResultView, \
subSearchTemplate, \
youtube) ->

  class SubscriptionSearchView extends Backbone.View

    el: '#subscription-search-region'

    events:
      'click #new-subscription' : 'showSubSearch'
      'submit #sub-search-form' : 'searchSubs'
      'click #search-subs'      : 'searchSubs'

    # # #
    # initialize: ->
    #   @showSubSearch { preventDefault: -> }
    #   youtube.searchSubs('dog').done @showSubResults
    # # #

    showSubSearch: (e) ->
      e.preventDefault()
      $('#subscription-search-region').append subSearchTemplate
      $('#sub-query').focus()

    searchSubs: (e) ->
      e.preventDefault()
      query = $('#sub-query').val()
      youtube.searchSubs(query).done @showSubResults

    showSubResults: (results) =>
      @clearSubResults()
      _.each results.feed.entry, @addSubSearchResult

    clearSubResults: ->
      $('#subscription-search-results').html('')

    addSubSearchResult: (entry) =>
      model = new SubscriptionSearchResultModel @mapDetails(entry)
      view = new SubscriptionSearchResultView model: model

      $('#subscription-search-results').append view.render().el

    mapDetails: (entry) ->
      channelId : entry.yt$channelId.$t
      title     : entry.title.$t
      author    : entry.author[0].name.$t
      thumb     : entry.media$thumbnail[0].url
