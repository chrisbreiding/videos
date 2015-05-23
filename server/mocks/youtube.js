module.exports = function(express, app) {
  var router = express.Router();

  router.get('/activities', function (req, res) {
    res.send({ ok: true });
  });

  router.get('/search', function (req, res) {
    res.send({
      items: [
        {
          id: { channelId: 'channel-id-1' },
          snippet: {
            channelTitle: 'Foo',
            title: 'Foo',
            thumbnails: { medium: { url: '/static/user-thumb.jpg' } }
          }
        },{
          id: { channelId: 'channel-id-2' },
          snippet: {
            channelTitle: 'Bar',
            title: 'Bar',
            thumbnails: { medium: { url: '/static/user-thumb.jpg' } }
          }
        }
      ]
    });
  });

  router.get('/channels', function (req, res) {
    res.send({
      items: [{ contentDetails: { relatedPlaylists: 'some-id' } }]
    });
  });

  router.get('/playlistItems', function (req, res) {
    res.send({
      items: [
        {
          contentDetails: { videoId: 'JDbYeaOnOBU' },
          snippet: {
            title: 'foo',
            description: 'foo video',
            publishedAt: '2015-05-22T02:59:06.000Z',
            thumbnails: { medium: { url: '/static/video-thumb.jpg' } }
          }
        }
      ]
    });
  });

  router.get('/videos', function (req, res) {
    res.send({
      items: [
        { contentDetails: { duration: 'PT13M19S' } }
      ]
    });
  });

  router.get('/thumb', function (req, res) {
    res.send({
      ok: true
    });
  });

  app.use('/api/youtube', router);
};
