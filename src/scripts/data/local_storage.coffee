App.LS = Ember.Object.extend

  init: ->
    @cache = {}

  fetch: (key)->
    key = @prefixify key

    unless @cache[key]?
      @cache[key] = JSON.parse(localStorage.getItem(key) || '{}')

    Ember.RSVP.resolve @cache[key]

  save: (key, value)->
    key = @prefixify key
    @cache[key] = value
    localStorage.setItem key, JSON.stringify(value)
    Ember.RSVP.resolve value

  remove: (key)->
    key = @prefixify key
    if @cache[key]
      delete @cache[key]
    localStorage.removeItem key
    Ember.RSVP.resolve()

  prefixify: (text)->
    "#{@get 'prefix'}#{text}"

App.ls = App.LS.create prefix: "#{App.NAMESPACE}."
