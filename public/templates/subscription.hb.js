define(['handlebars'], function(Handlebars) {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
return templates['subscription.hb'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<img class=\"pull-left\" src=\"";
  foundHelper = helpers.thumb;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.thumb; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\" width=\"50\" height=\"50\" />\n<p class=\"buttons pull-right\">\n  <a class=\"view-subscription btn btn-inverse btn-small\" href=\"#\">\n    View\n    <i class=\"icon-chevron-right\"></i>\n  </a>\n  <a class=\"toggle-playlists\" href=\"#\">\n    Playlists\n    <i class=\"icon-chevron-down\"></i>\n  </a>\n</p>\n<a class=\"delete-subscription pull-right btn btn-danger btn-small\" href=\"#\">\n  <i class=\"icon-minus-sign\"></i>\n  Delete\n</a>\n<h4>";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h4>\n<p>";
  foundHelper = helpers.author;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.author; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n";
  return buffer;});
});