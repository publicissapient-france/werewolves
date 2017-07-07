process.env.NODE_ENV = 'test';

const expect = require('chai').expect;

const TTSService = require('../../app/tts/service.tts');

describe('TTS', () => {
  describe('format filename', () => {
    it('replace space', () => {
      const filename = TTSService.createFilenameFromText('hello my name is john', 'mp3');
      expect(filename).to.equal('hello_my_name_is_john.mp3');
    });

    it('replace other than alpha', () => {
      const filename = TTSService.createFilenameFromText('hello & ? ° my name is john', 'mp3');
      expect(filename).to.equal('hello_my_name_is_john.mp3');
    });
  });

  describe('retrieve', () => {
    it('hello', // eslint-disable-next-line
      function (done) {
        this.timeout(30000);

        TTSService.read('my name is john')
          .then(() => done())
          .catch(done);
      });
  });
});
