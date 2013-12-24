App.Sub = Ember.Object.extend()

App.Sub.reopenClass

  find: (id)->
    App.Store.find 'sub', id

  createRecord: (record)->
    App.Store.createRecord 'sub', record

  deleteRecord: (record)->
    App.Store.deleteRecord 'sub', record
