App.Router.map ->
  @resource 'subs', ->
    @resource 'sub', path: ':sub_id'
