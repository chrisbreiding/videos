App.SubsController = Ember.ArrayController.extend

  editing: false
  searching: false

  actions:
    toggleEditing: ->
      @set 'editing', !@get('editing')

    toggleSearching: ->
      @set 'subSearchResults', []
      @set 'subQuery', ''
      @set 'searching', !@get('searching')

    searchSubs: ->
      request = App.youTube.searchChannels @get('subQuery')
      request.done (subs)=>
        @set 'subSearchResults', subs

    add: (sub)->
      App.Sub.createRecord sub
      @get('subSearchResults').removeObject sub
      @get('store').commit()

    delete: (sub)->
      sub.deleteRecord()
      @get('store').commit()

  renderTemplate: ->
    @render outlet: 'main'
