const assert = require('assert');
const sinon = require('sinon');
const Game = require('../../app/core/game');
const Repository = require('../../app/services/repository');
const PlayerRepository = require('../../app/services/playerRepository');

describe('Game - distributeRoles', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('all players should have a role', (done) => {
    var firebaseRefStub = sinon.spy();
    var repositoryStub = sandbox.stub(PlayerRepository, 'refPlayer')
      .returns({update: firebaseRefStub});
    var updatePlayerCount = sandbox.stub(Repository, 'updatePlayerCount');

    const game = new Game();
    Object.assign(game, {
      "players": {
        "benjamin_": {
          "name": "benjamin_"
        },
        "jean_": {
          "name": "jean_"
        },
        "julien_": {
          "name": "julien_"
        },
        "michael_": {
          "name": "michael_"
        },
        "pablo_": {
          "name": "pablo_"
        },
        "qian_": {
          "name": "qian_"
        }
      }
    })
    game.distributeRoles()
      .then(() => {
        var countWerewolves = 0;
        var countVillagers = 0;
        for (var i = 0; i < 6; i++) {
          if (firebaseRefStub.args[i][0].role == "VILLAGER")
            countVillagers++
          else if (firebaseRefStub.args[i][0].role == "WEREWOLF")
            countWerewolves++
        }
        assert(updatePlayerCount.calledWith(game.id, 6));
        assert.equal(repositoryStub.callCount, 6);
        assert.equal(firebaseRefStub.callCount, 6);
        assert.equal(countWerewolves, 2);
        assert.equal(countVillagers, 4);
        done();
      })
      .catch(done);
  });
})
;
