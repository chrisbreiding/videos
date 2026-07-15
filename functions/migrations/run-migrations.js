const { onRequest } = require('firebase-functions/v2/https')
const { logger } = require('firebase-functions')

const { loadMigrations } = require('./index')

// Runs each migration in ./migrations that hasn't already run, recording its
// name in the `migrations` collection so it's skipped on future invocations.
exports.runMigrations = (admin, db) => onRequest(async (req, res) => {
  const migrationsCollection = db.collection('migrations')
  const migrations = loadMigrations()

  let migrationsRun = 0

  for (const migration of migrations) {
    const migrationDoc = migrationsCollection.doc(migration.name)
    const snapshot = await migrationDoc.get()

    if (snapshot.exists) continue

    logger.info(`Running migration: ${migration.name}`)

    await migration.run(admin, db)
    await migrationDoc.set({ ranAt: new Date().toISOString() })

    migrationsRun++
  }

  const message = `Ran ${migrationsRun} ${migrationsRun === 1 ? 'migration' : 'migrations'}`

  logger.info(message)

  res.status(200).send(message)
})
