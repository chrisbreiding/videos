App.SubsController = Ember.ArrayController.extend

  searchingSubs: false

  toggleSubSearch: ->
    @set 'subSearchResults', []
    @set 'searchingSubs', !@get('searchingSubs')

  searchSubs: ->
    request = App.youTube.searchChannels @get('subQuery')
    request.done (subs)=>
      @set 'subSearchResults', subs
