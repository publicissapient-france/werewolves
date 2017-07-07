process.env.NODE_ENV = 'test';

const TalkService = require('../../app/talk/service-talk');

describe('Talk', () => {
  it('Play 2 times without closing connection', // eslint-disable-next-line
    function (done) {
      this.timeout(30000);
      const service = new TalkService();

      const media = 'http://www.noiseaddicts.com/samples_1w72b820/4939.mp3';

      service.connect()
        .then(() => service.talk(media))
        .then(() => service.talk(media))
        .then(() => service.disconnect())
        .then(() => done())
        .catch(done);
    });
});
