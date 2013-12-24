NAMESPACE = 'byt'

Store = Ember.Object.extend

  init: ->
    @_loadData()

  find: (type, id)->
    if id?
      found = @_findById type, id
    else
      found = @_findAll type, id

    Ember.RSVP.resolve found

  createRecord: (type, record)->
    createRecordWithId type, record, @_randomId()

  createRecordWithId: (type, record, id)->
    record.id = id
    record = @_namespaceForType(type).create record
    records = @_recordsForType type
    records[id] = record
    @_saveData()
    Ember.RSVP.resolve record

  updateRecord: (type, record)->
    records = @_recordsForType type
    records[record.get('id')] = record
    @_saveData()
    Ember.RSVP.resolve record

  deleteRecord: (type, record)->
    records = @_recordsForType type
    delete records[record.get('id')]
    @_saveData()
    Ember.RSVP.resolve()

  _loadData: ->
    storage = localStorage.getItem NAMESPACE
    @_data = if storage then JSON.parse(storage) else {}

  _saveData: ->
    localStorage.setItem NAMESPACE, JSON.stringify(@_data)

  _randomId: ->
    return Math.random().toString(32).slice(2).substr(0, 5)

  _findById: (type, id)->
    record = @_recordForType(type, id)
    record and @_namespaceForType(type).create record

  _findAll: (type, id)->
    records = @_recordsForType type
    if Object.keys(records).length > 0
      namespace = @_namespaceForType type
      Em.A (namespace.create(record) for id, record of records)
    else
      null

  _recordForType: (type, id)->
    unless @_data[type]?['records']?
      @_data[type] = records: {}

    @_data[type]['records'][id]

  _recordsForType: (type)->
    if @_data[type]? and @_data[type]['records']?
      @_data[type]['records']
    else
      @_data[type] = records: {}
      {}

  _namespaceForType: (type)->
    App[type.classify()]

App.Store = Store.create()
