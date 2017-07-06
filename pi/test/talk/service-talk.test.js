process.env.NODE_ENV = 'test';

const TalkService = require('../../app/talk/service-talk');

describe('Play WAV', () => {
  it('Nominal', // eslint-disable-next-line
    function (done) {
      this.timeout(30000);
      const service = new TalkService();

      const media = {
        contentId: 'http://www.wavsource.com/snds_2017-06-18_4861080274558637/movies/aladdin/aladdin_cant_believe.wav',
        contentType: 'audio/wav',
        streamType: 'BUFFERED',
        metadata: {
          type: 0,
          metadataType: 0,
          title: 'Big Buck Bunny',
          images: [
            {
              url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
            },
          ],
        },
      };

      service.emitter.on('end', () => {
        service.disconnect();
        done();
      });

      service.connect()
        .then(() => service.talk(media))
        .catch(done);

      setTimeout(() => {
      }, 20000);
    });
});
