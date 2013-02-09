define ['backbone', 'channels/channel-model'], (Backbone, ChannelModel)->

  class ChannelCollection extends Backbone.Collection

    model: ChannelModel
