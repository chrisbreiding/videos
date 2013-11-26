App.VideoRoute = Ember.Route.extend

  model: (params)->
    App.youTube.getVideoById params.video_id

  serialize: (model)->
    video_id: model.get 'videoId'

  renderTemplate: ->
    @render
      into: 'application'
      outlet: 'viewer'
