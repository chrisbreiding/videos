(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'templates/paginator-item.hb'], function(Backbone, itemTemplate) {
    var PaginatorView;
    return PaginatorView = (function(_super) {

      __extends(PaginatorView, _super);

      function PaginatorView() {
        this.render = __bind(this.render, this);
        return PaginatorView.__super__.constructor.apply(this, arguments);
      }

      PaginatorView.prototype.initialize = function(options) {
        this.collection = options.collection;
        return this.page = options.page || 1;
      };

      PaginatorView.prototype.events = {
        'click a': 'goToPage'
      };

      PaginatorView.prototype.render = function() {
        var i, pageCount, pages, _i;
        pageCount = Math.ceil(this.count / 25);
        pages = [
          itemTemplate({
            label: '«',
            to: 'previous'
          })
        ];
        for (i = _i = 1; 1 <= pageCount ? _i <= pageCount : _i >= pageCount; i = 1 <= pageCount ? ++_i : --_i) {
          pages.push(itemTemplate({
            label: i,
            to: i
          }));
        }
        pages.push(itemTemplate({
          label: '»',
          to: 'next'
        }));
        return this.$el.html(pages.join(''));
      };

      PaginatorView.prototype.update = function(count) {
        this.count = count;
        return this.render();
      };

      PaginatorView.prototype.goToPage = function(e) {
        var to;
        to = $(e.target).data('to');
        this.page = (function() {
          switch (to) {
            case 'previous':
              return this.page - 1;
            case 'next':
              return this.page + 1;
            default:
              return Number(to);
          }
        }).call(this);
        return this.collection.loadPage(this.page);
      };

      return PaginatorView;

    })(Backbone.View);
  });

}).call(this);
