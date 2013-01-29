define(['handlebars'], function(Handlebars) {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['current-video.hb'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<iframe\n  width=\"960\" height=\"540\"\n  src=\"http://www.youtube.com/embed/";
  foundHelper = helpers.videoId;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.videoId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "?rel=0&autoplay=1\"\n  frameborder=\"0\" allowfullscreen>\n</iframe>\n";
  return buffer;});
});