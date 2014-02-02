Ember.Handlebars.helper 'date', (date)->
  mDate = moment(date)
  formattedDate = "#{mDate.fromNow()}<br /><span>#{mDate.format('MMM D, YYYY h:mma')}</span>"

  new Handlebars.SafeString(formattedDate);
