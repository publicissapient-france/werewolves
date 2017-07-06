process.env.NODE_ENV = 'test';

const TalkService = require('../../app/talk/service-talk');

describe('Chromecast client', () => {
  it('talk', // eslint-disable-next-line
    function () {
      this.timeout(10000);
      const service = new TalkService();
      service.talk();
    });
});
