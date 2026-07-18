const { MAX_BATCH_SIZE } = require('../constants')

// Adds a `type` ('custom' or 'channel') to every sub and removes the old
// `isCustom` flag it replaces.
module.exports = async (admin, db) => {
  const usersSnapshot = await db.collection('users').get()

  const commits = []
  let batch = db.batch()
  let batchWrites = 0

  usersSnapshot.forEach((doc) => {
    const subs = doc.get('subs') || {}
    const updates = {}

    Object.entries(subs).forEach(([id, sub]) => {
      updates[`subs.${id}.type`] =
        sub.isCustom || id.startsWith('custom-') ? 'custom' : 'channel'

      if (sub.isCustom !== undefined) {
        updates[`subs.${id}.isCustom`] = admin.firestore.FieldValue.delete()
      }
    })

    if (Object.keys(updates).length) {
      batch.update(doc.ref, updates)
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
}
