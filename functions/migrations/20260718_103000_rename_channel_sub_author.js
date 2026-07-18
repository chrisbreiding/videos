const { MAX_BATCH_SIZE } = require('../constants')

// For every 'channel' sub, backfills a missing `title`/`author` from the
// other, then renames `author` to `originalTitle`.
module.exports = async (admin, db) => {
  const usersSnapshot = await db.collection('users').get()

  const commits = []
  let batch = db.batch()
  let batchWrites = 0

  usersSnapshot.forEach((doc) => {
    const subs = doc.get('subs') || {}
    const updates = {}

    Object.entries(subs).forEach(([id, sub]) => {
      if (sub.type !== 'channel') return

      const hasTitle = sub.title !== undefined
      const hasAuthor = sub.author !== undefined

      if (!hasTitle && hasAuthor) {
        updates[`subs.${id}.title`] = sub.author
      }

      if (hasAuthor) {
        updates[`subs.${id}.originalTitle`] = sub.author
        updates[`subs.${id}.author`] = admin.firestore.FieldValue.delete()
      } else if (hasTitle) {
        updates[`subs.${id}.originalTitle`] = sub.title
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
