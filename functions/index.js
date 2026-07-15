const admin = require('firebase-admin')
const { pruneWatchVideos } = require('./scheduled/prune-watched-videos')
const { runMigrations } = require('./migrations/run-migrations')

admin.initializeApp()

const db = admin.firestore()

exports.pruneWatchVideos = pruneWatchVideos(admin, db)
exports.runMigrations = runMigrations(admin, db)
