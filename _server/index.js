const args = require('yargs').argv;
const express = require('express');
const globSync = require('glob').sync;
const mocks = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
const morgan = require('morgan');

const constants = require('./constants');

const app = express();

app.use(express.static(process.cwd() + '/dist'));
app.use('/static', express.static(__dirname + '/static'));
app.use(morgan('dev'));

const router = express.Router();
router.use((req, res, next) => {
  if (req.query.key !== constants.API_KEY) {
    return res.status(401).end();
  }
  next();
});
app.use('/api', router);

mocks.forEach((route) => route(express, app));

const port = args.port || 8080;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}...`);
});
