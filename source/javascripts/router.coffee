App.Router.map ->
  @resource 'subs', ->
    @resource 'sub', path: ':sub_id', ->
      @resource 'video', path: 'viewing/:video_id'
