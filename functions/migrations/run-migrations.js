const admin = require('firebase-admin')
const { logger } = require('firebase-functions')
const { onRequest } = require('firebase-functions/v2/https')
const fs = require('fs')
const path = require('path')

admin.initializeApp()

const db = admin.firestore()

// Migration files are named `yyyymmdd_hhmmss_<description>.js` and export a
// single `async (admin, db) => {}` function. Sorting the filenames sorts them
// chronologically since the timestamp is the leading, fixed-width segment.
const loadMigrations = () => {
  return fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file.endsWith('.js') &&
        file !== 'index.js' &&
        file !== 'run-migrations.js',
    )
    .sort()
    .map((file) => ({
      name: path.basename(file, '.js'),
      run: require(path.join(__dirname, file)),
    }))
}

// Runs each migration in ./migrations that hasn't already run, recording its
// name in the `migrations` collection so it's skipped on future invocations.
exports.runMigrations = onRequest(async (req, res) => {
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
