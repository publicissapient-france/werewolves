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
    it('lights', // eslint-disable-next-line
      function (done) {
        this.timeout(5000);
        lightService.searchBridge()
          .then(() => {
            lightService.initApi();
            lightService.findLights()
              .then(() => done());
          })
          .catch(done);
      });
    it('turn on/off', // eslint-disable-next-line
      function (done) {
        this.timeout(5000);
        lightService.searchBridge()
          .then(() => {
            lightService.initApi();
            lightService.turnLightOn(1)
              .then(() => new Promise(resolve => setTimeout(() => resolve(), 2000)))
              .then(() => lightService.turnLightOff(1))
              .then(() => done());
          })
          .catch(done);
      });
  });
});
