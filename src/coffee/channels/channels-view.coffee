define [
  'backbone', 'templates/subscription-search.hb', 'services/youtube', \
  'channels/channel-model', 'channels/channel-view'
],
(Backbone, template, youtube, \
ChannelModel, ChannelView)->

  class SubscriptionSearchView extends Backbone.View

    el: '#subscription-search-region'

    $subSearch: $ '#subscription-search-region'
    $results: $ '#subscription-search-results'

    events:
      'click #new-subscription' : 'showSubSearch'
      'submit #sub-search-form' : 'searchSubs'
      'click #search-subs'      : 'searchSubs'

    showSubSearch: (e)->
      e.preventDefault()
      $('#new-subscription').after template
      $('#sub-query').focus()

    searchSubs: (e)->
      e.preventDefault()
      query = $('#sub-query').val()
      youtube.searchChannels(query).done @showResults

    showResults: (results)=>
      @clearResults()
      _.each results.feed.entry, @addResult

    clearResults: ->
      @$results.html ''

    addResult: (entry)=>
      model = new ChannelModel youtube.mapChannelDetails(entry)
      view = new ChannelView model: model

      @$results.append view.render().el
