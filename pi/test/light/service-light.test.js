process.env.NODE_ENV = 'test';

const expect = require('chai').expect;

const LightService = require('../../app/light/service.light');

describe('Light', () => {
  describe('Bridge', () => {
    const lightService = new LightService();
    it('search for bridge', // eslint-disable-next-line
      function (done) {
        lightService.searchBridge()
          .then(() => {
            expect(lightService.ip).to.exist;
            done();
          })
          .catch(done);
      });
    it('register', // eslint-disable-next-line
      function (done) {
        lightService.register()
          .then(() => {
            expect(lightService.username).to.exist;
            done();
          })
          .catch(done);
      });
    it('', // eslint-disable-next-line
      function (done) {
      });
  });
});
