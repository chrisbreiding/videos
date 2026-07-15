const fs = require('fs')
const path = require('path')

// Migration files are named `yyyymmdd_hhmmss_<description>.js` and export a
// single `async (admin, db) => {}` function. Sorting the filenames sorts them
// chronologically since the timestamp is the leading, fixed-width segment.
const loadMigrations = () => {
  return fs.readdirSync(__dirname)
    .filter((file) => file.endsWith('.js') && file !== 'index.js' && file !== 'run-migrations.js')
    .sort()
    .map((file) => ({
      name: path.basename(file, '.js'),
      run: require(path.join(__dirname, file)),
    }))
}

module.exports = {
  loadMigrations,
}
