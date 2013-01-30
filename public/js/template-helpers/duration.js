(function() {

  define(['handlebars', 'moment'], function(Handlebars, moment) {
    return Handlebars.registerHelper('duration', function(duration) {
      var minutes, seconds;
      minutes = Math.floor(duration / 60);
      seconds = duration % 60;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      return "" + minutes + ":" + seconds;
    });
  });

}).call(this);
