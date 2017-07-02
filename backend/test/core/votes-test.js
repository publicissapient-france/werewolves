const assert = require('assert');
const Votes = require('../../app/core/votes');

describe('Votes', () => {

  it('should count votes = 0', () => {
    const votes = new Votes();
    assert.equal(votes.countVotes(), 0);
  });

  it('should count votes = 3', () => {
    const votes = new Votes(
      {
        julien: { voted: 'bob' },
        bob: { voted: 'pablo' },
        qian: { voted: 'pablo' },
      });
    assert.equal(votes.countVotes(), 3);
  });


  it('should get majority = []', () => {
    const votes = new Votes();
    assert.deepEqual(votes.getMajority(), []);
  });

  it('should get majority = [pablo]', () => {
    const votes = new Votes(
      {
        julien: { voted: 'bob' },
        bob: { voted: 'pablo' },
        qian: { voted: 'pablo' },
      });
    assert.deepEqual(votes.getMajority(), ['pablo']);
  });

  it('should get majority = [pablo, bob]', () => {
    const votes = new Votes(
      {
        julien: { voted: 'bob' },
        michael: { voted: 'bob' },
        bob: { voted: 'pablo' },
        qian: { voted: 'pablo' },
      });
    assert.deepEqual(votes.getMajority(), ['bob', 'pablo']);
  });
});
