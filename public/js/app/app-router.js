(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'app/app-view'], function(Backbone, AppView) {
    var AppRouter;
    AppRouter = (function(_super) {

      __extends(AppRouter, _super);

      function AppRouter() {
        return AppRouter.__super__.constructor.apply(this, arguments);
      }

      AppRouter.prototype.start = function() {
        Backbone.history.start({
          pushState: true
        });
        return new AppView;
      };

      return AppRouter;

    })(Backbone.Router);
    return new AppRouter;
  });

}).call(this);
