define(['handlebars'], function(Handlebars) {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['video.hb'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  buffer += "<a class=\"play-video pull-left\" href=\"#\">\n  <img src=\"";
  foundHelper = helpers.thumb;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.thumb; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\" width=\"150\" />\n  <i class=\"icon-play-circle\"></i>\n</a>\n<h4>";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n<p class=\"pub-date pull-right\">";
  stack1 = depth0.published;
  foundHelper = helpers.date;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "date", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</p>\n<p class=\"duration\">\n  <span class=\"label label-inverse\">\n    <i class=\"icon-time\"></i>\n    ";
  stack1 = depth0.duration;
  foundHelper = helpers.duration;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "duration", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "\n  </span>\n</p>\n";
  return buffer;});
});