module.exports = (express, app) => {
  var router = express.Router();

  router.get('/activities', (req, res) => {
    res.send({ ok: true });
  });

  router.get('/search', (req, res) => {
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
        },{
          id: { channelId: 'channel-id-3' },
          snippet: {
            channelTitle: 'Qux',
            title: 'Qux',
            thumbnails: { medium: { url: '/static/user-thumb.jpg' } }
          }
        }
      ]
    });
  });

  router.get('/channels', (req, res) => {
    res.send({
      items: [{ contentDetails: { relatedPlaylists: 'some-id' } }]
    });
  });

  router.get('/playlistItems', (req, res) => {
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

  router.get('/videos', (req, res) => {
    res.send({
      items: [
        { contentDetails: { duration: 'PT13M19S' } }
      ]
    });
  });

  router.get('/thumb', (req, res) => {
    res.send({
      ok: true
    });
  });

  app.use('/api/youtube', router);
};
