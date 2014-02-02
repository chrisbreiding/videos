App.TextField = Ember.TextField.extend

  didInsertElement: ->
    @_super()
    @get('element').focus()
