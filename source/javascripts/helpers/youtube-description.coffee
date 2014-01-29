Ember.Handlebars.helper 'youtube-description', (text)->
  if text
    text = text.replace /\n/g, '<br />'
    text = text.replace /\b(http[-A-Za-z0-9\.\:\/\?\=]+)\b/g, '<a href="$1" target="_blank">$1</a>'
    new Ember.Handlebars.SafeString text
