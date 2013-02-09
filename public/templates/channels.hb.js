define(['handlebars'], function(Handlebars) {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['channels.hb'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<form id=\"sub-search-form\" class=\"form-inline\">\n    <input type=\"text\" id=\"sub-query\">\n    <button class=\"btn btn-primary\" id=\"search-subs\">\n      <i class=\"icon-search\"></i>\n    </button>\n</form>\n";});
});