App.NowPlayingController = Ember.ObjectController.extend

  src: (->
    "http://www.youtube.com/embed/#{@get('id')}?rel=0&autoplay=1"
  ).property 'id'
