var express = require('express');
var globSync = require('glob').sync;
var mocks = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
var morgan = require('morgan');

var constants = require('./constants');

var app = express();

app.use(express.static(process.cwd() + '/dist'));
app.use('/static', express.static(__dirname + '/static'));
app.use(morgan('dev'));

var router = express.Router();
router.use(function (req, res, next) {
  if (req.query.key !== constants.API_KEY) {
    return res.status(401).end();
  }
  next();
});
app.use('/api', router);

mocks.forEach(function(route) { route(express, app); });

var port = 8080;
app.listen(port, function () {
  console.log('listening on http://localhost:' + port + '...');
});
