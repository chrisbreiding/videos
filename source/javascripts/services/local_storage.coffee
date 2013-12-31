namespaceify = (text)->
  "#{App.NAMESPACE}_#{text}"

LS = Ember.Object.extend

  init: ->
    @cache = {}

  get: (key)->
    key = namespaceify key

    unless @cache[key]?
      @cache[key] = JSON.parse(localStorage.getItem(key) || '{}')

    Ember.RSVP.resolve @cache[key]

  set: (key, value)->
    key = namespaceify key
    @cache[key] = value
    localStorage.setItem key, JSON.stringify(value)
    Ember.RSVP.resolve value

App.ls = LS.create()
