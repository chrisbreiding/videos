re = /^P(?:(\d+(?:[\.,]\d{0,3})?W)|(\d+(?:[\.,]\d{0,3})?Y)?(\d+(?:[\.,]\d{0,3})?M)?(\d+(?:[\.,]\d{0,3})?D)?(?:T(\d+(?:[\.,]\d{0,3})?H)?(\d+(?:[\.,]\d{0,3})?M)?(\d+(?:[\.,]\d{0,3})?S)?)?)$/

HR  = 5
MIN = 6
S   = 7

parseIso8601Duration = (text)->
  matches = text.match re

  _.reduce [HR, MIN, S], (memo, index)->
    if matches[index]
      memo.push parseInt(matches[index], 10).toString()
    else if index is MIN or index is S
      memo.push '0'
    memo
  , []

toTwoDigits = (num)-> if num.length is 2 then num else "0#{num}"

Ember.Handlebars.helper 'duration', (duration)->
  parsed = parseIso8601Duration duration

  parts = _.map parsed.slice(1), toTwoDigits
  parts.unshift parsed[0]
  parts.join ':'
