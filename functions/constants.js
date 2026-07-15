const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

// Firestore allows at most 500 writes per batch. Each user doc counts as a
// single write regardless of how many watchedVideos fields we delete from it.
const MAX_BATCH_SIZE = 500

module.exports = {
  NINETY_DAYS_MS,
  MAX_BATCH_SIZE,
}
