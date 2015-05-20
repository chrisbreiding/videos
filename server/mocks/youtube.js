module.exports = function(express, app) {
  var router = express.Router();

  router.get('/activities', function(req, res) {
    res.send({ ok: true });
  });

  app.use('/api/youtube', router);
};
