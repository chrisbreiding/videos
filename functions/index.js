const { pruneWatchedVideos } = require('./scheduled/prune-watched-videos')
const { runMigrations } = require('./migrations/run-migrations')

exports.pruneWatchedVideos = pruneWatchedVideos
exports.runMigrations = runMigrations
