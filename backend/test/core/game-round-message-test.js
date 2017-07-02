const assert = require('assert');
const sinon = require('sinon');
const Game = require('../../app/core/game');
const Players = require('../../app/core/players');
const Repository = require('../../app/services/repository');

describe('Game - RoundMEssage', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should declare werewolves as winners if there is one villager alive and one wolf alive', (done) => {
    sandbox
    .stub(Repository, 'getAlivePlayers')
    .returns(Promise.resolve(new Players({
      jsm: { role: 'WEREWOLF' },
      plo: { role: 'VILLAGER' },
    })));

    new Game().getRoundEndMessage()
    .then(message => assert.equal(message, 'WEREWOLVES_VICTORY'))
    .then(done)
    .catch(done);
  });

  it('should declare villagers as winners if there is zero wolf alive', (done) => {
    sandbox
    .stub(Repository, 'getAlivePlayers')
    .returns(Promise.resolve(new Players({
      jsm: { role: 'VILLAGER' },
      plo: { role: 'VILLAGER' },
    })));

    new Game().getRoundEndMessage()
    .then(message => assert.equal(message, 'VILLAGERS_VICTORY'))
    .then(done)
    .catch(done);
  });

  it('should declare no one as winners if there is at most two villagers and at most one wolf alive', (done) => {
    sandbox
    .stub(Repository, 'getAlivePlayers')
    .returns(Promise.resolve(new Players({
        jsm: { role: 'VILLAGER' },
        bla: { role: 'VILLAGER' },
        plo: { role: 'WEREWOLF' },
      })));
    new Game().getRoundEndMessage()
    .then(message => assert.equal(message, undefined))
    .then(done)
    .catch(done);
  });
});
