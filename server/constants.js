const args = require('yargs').argv;

module.exports = {
  API_KEY: args.apikey || 'apikey'
};
