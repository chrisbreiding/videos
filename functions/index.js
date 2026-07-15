const admin = require('firebase-admin')
const { pruneWatchVideos } = require('./scheduled/prune-watched-videos')

admin.initializeApp()

const db = admin.firestore()

exports.pruneWatchVideos = pruneWatchVideos(admin, db)
