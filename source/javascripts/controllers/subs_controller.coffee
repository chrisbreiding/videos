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
      App.Sub.createRecord(sub).then (record)=>
        @addObject record
      @get('subSearchResults').removeObject sub

    delete: (sub)->
      @removeObject sub
      App.Sub.deleteRecord sub
