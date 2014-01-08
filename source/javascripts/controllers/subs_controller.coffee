App.SubsController = Ember.ArrayController.extend

  editing: false
  searching: false

  actions:

    toggleEditing: ->
      @toggleProperty 'editing'
      return

    toggleSearching: ->
      @set 'subSearchResults', []
      @set 'subQuery', ''
      @toggleProperty 'searching'
      return

    searchSubs: ->
      request = App.youTube.searchChannels @get('subQuery')
      request.done (subs)=>
        @set 'subSearchResults', subs

    add: (sub)->
      @get('subSearchResults').removeObject sub
      @store.createRecord('sub', sub).save()

    delete: (sub)->
      @removeObject sub
      sub.destroyRecord()

    makeDefault: (sub)->
      return if sub.get 'default'

      @store.find('sub', default: true).then (currentDefaults)->
        if currentDefaults.get('content').length
          currentDefault = currentDefaults.get 'firstObject'
          currentDefault.set 'default', false
          currentDefault.save()

      sub.set 'default', true
      sub.save()
