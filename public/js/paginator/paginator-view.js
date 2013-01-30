(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone'], function(Backbone) {
    var PaginatorView;
    return PaginatorView = (function(_super) {

      __extends(PaginatorView, _super);

      function PaginatorView() {
        this.render = __bind(this.render, this);
        return PaginatorView.__super__.constructor.apply(this, arguments);
      }

      PaginatorView.prototype.tagName = 'ul';

      PaginatorView.prototype.className = 'paginator clearfix';

      PaginatorView.prototype.template = template;

      PaginatorView.prototype.events = {
        'click li': 'viewPage'
      };

      PaginatorView.prototype.initialize = function() {
        return this.model.on('destroy', this.remove, this);
      };

      PaginatorView.prototype.render = function() {
        return this;
      };

      PaginatorView.prototype.viewPage = function() {};

      return PaginatorView;

    })(Backbone.View);
  });

}).call(this);
