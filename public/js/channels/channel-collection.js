(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'channels/channel-model'], function(Backbone, ChannelModel) {
    var ChannelCollection;
    return ChannelCollection = (function(_super) {

      __extends(ChannelCollection, _super);

      function ChannelCollection() {
        return ChannelCollection.__super__.constructor.apply(this, arguments);
      }

      ChannelCollection.prototype.model = ChannelModel;

      return ChannelCollection;

    })(Backbone.Collection);
  });

}).call(this);
