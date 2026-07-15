const admin = require('firebase-admin')
const { pruneWatchedVideos } = require('./scheduled/prune-watched-videos')
const { runMigrations } = require('./migrations/run-migrations')

admin.initializeApp()

const db = admin.firestore()

exports.pruneWatchVideos = pruneWatchedVideos(admin, db)
exports.runMigrations = runMigrations(admin, db)
