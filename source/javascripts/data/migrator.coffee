Migrator = Ember.Object.extend

  init: ->
    @migrations = {}

  registerMigration: (version, migration)->
    @migrations[version] = migration

  runMigrations: ->
    new Ember.RSVP.Promise (resolve)=>
      App.ls.fetch('version').then (version)=>
        return resolve() if version is App.VERSION

        version = '0.0.0' unless _.isString version
        versionAssistant = App.VersionAssistant.create versions: _.keys(@migrations)
        versions = versionAssistant.versionsSince version
        operations = (@migrations[version]() for version in versions)
        operations.push App.ls.save('version', App.VERSION)

        Ember.RSVP.all(operations).then -> resolve()

App.migrator = Migrator.create()
