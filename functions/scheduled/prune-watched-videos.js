const admin = require('firebase-admin')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { logger } = require('firebase-functions')

const { NINETY_DAYS_MS, MAX_BATCH_SIZE } = require('../constants')

admin.initializeApp()

const db = admin.firestore()

// Runs every night at 3:00am Eastern Time and removes watchedVideos entries
// whose most recent update (updatedAt, an ISO-8601 date string) is older than
// 90 days. ISO-8601 strings compare lexicographically in chronological order,
// so a plain string comparison against the cutoff is valid.
exports.pruneWatchedVideos = onSchedule(
  {
    schedule: '0 3 * * *',
    timeZone: 'America/New_York',
  },
  async () => {
    const cutoff = new Date(Date.now() - NINETY_DAYS_MS).toISOString()
    const usersSnapshot = await db.collection('users').get()

    const commits = []
    let batch = db.batch()
    let batchWrites = 0
    let usersUpdated = 0
    let entriesRemoved = 0

    usersSnapshot.forEach((doc) => {
      const watchedVideos = doc.get('watchedVideos') || {}
      const removals = {}

      for (const [videoId, entry] of Object.entries(watchedVideos)) {
        if (entry && entry.updatedAt < cutoff) {
          removals[`watchedVideos.${videoId}`] = admin.firestore.FieldValue.delete()
          entriesRemoved++
        }
      }

      if (Object.keys(removals).length) {
        batch.update(doc.ref, removals)
        usersUpdated++
        batchWrites++

        if (batchWrites === MAX_BATCH_SIZE) {
          commits.push(batch.commit())
          batch = db.batch()
          batchWrites = 0
        }
      }
    })

    if (batchWrites) commits.push(batch.commit())

    await Promise.all(commits)

    logger.info(
      `Pruned ${entriesRemoved} watchedVideos ${entriesRemoved === 1 ? 'entry' : 'entries'} older than 90 days across ${usersUpdated} ${usersUpdated === 1 ? 'user' : 'users'}`,
    )
  },
)
