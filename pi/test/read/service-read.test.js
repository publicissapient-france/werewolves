process.env.NODE_ENV = 'test';

const expect = require('chai').expect;

const TTSService = require('../../app/read/service.read');

describe('Read', () => {
  describe('Filename', () => {
    it('Replace space', () => {
      const filename = TTSService.createFilenameFromText('hello my name is john', 'mp3');
      expect(filename).to.equal('hello_my_name_is_john.mp3');
    });

    it('Replace other than alpha', () => {
      const filename = TTSService.createFilenameFromText('hello & ? ° my name is john', 'mp3');
      expect(filename).to.equal('hello_my_name_is_john.mp3');
    });
  });

  describe('Retrieve', () => {
    it('Sentence', // eslint-disable-next-line
      function (done) {
        this.timeout(30000);

        TTSService.read('Welcome to werewolves of Hull')
          .then(() => done())
          .catch(done);
      });
  });
});
