(function() {

  define(['handlebars', 'moment'], function(Handlebars, moment) {
    return Handlebars.registerHelper('date', function(date) {
      var formattedDate, mDate;
      mDate = moment(date);
      formattedDate = "" + (mDate.fromNow()) + " <span>(" + (mDate.format('MMM D, YYYY h:mma')) + ")</span>";
      return new Handlebars.SafeString(formattedDate);
    });
  });

}).call(this);
