Ember.Handlebars.helper 'duration', (duration)->
  minutes = Math.floor(duration / 60)
  seconds = duration % 60
  seconds = if seconds < 10 then "0#{seconds}" else seconds

  "#{minutes}:#{seconds}"
