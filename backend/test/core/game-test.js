const assert = require('assert');
const sinon = require('sinon');
const Game = require('../../app/core/game');
const Repository = require('../../app/services/repository');
const PlayerRepository = require('../../app/services/playerRepository');

const sixPlayers = {
  "players": {
    "benjamin_": {},
    "jean_": {},
    "julien_": {},
    "michael_": {},
    "pablo_": {},
    "qian_": {}
  }
}

describe('Game - role distribution', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('roles should be distribued as planified', (done) => {
    var updateStub = sinon.spy();
    var repositoryStub = sandbox.stub(PlayerRepository, 'refPlayer')
      .returns({update: updateStub});
    var updatePlayerCount = sandbox.stub(Repository, 'updatePlayerCount');

    const game = new Game();
    Object.assign(game, sixPlayers);
    game.distributeRoles()
      .then(() => {
        var countWerewolves = 0;
        var countVillagers = 0;
        for (var i = 0; i < 6; i++) {
          if (updateStub.args[i][0].role == "VILLAGER")
            countVillagers++;
          else if (updateStub.args[i][0].role == "WEREWOLF")
            countWerewolves++;
        }
        assert(updatePlayerCount.calledWith(game.id, 6));
        assert.equal(repositoryStub.callCount, 6);
        assert.equal(updateStub.callCount, 6);
        assert.equal(countWerewolves, 2);
        assert.equal(countVillagers, 4);
        done();
      })
      .catch(done);
  });

  it('when game begins, players should be alive and game should advance to next phase', (done) => {
    var updateStub = sinon.spy();
    var offStub = sinon.spy();
    var repositoryStub = sandbox.stub(PlayerRepository, 'refPlayer')
      .returns({update: updateStub, off: offStub});

    const game = new Game();
    Object.assign(game, sixPlayers);
    var gameStub = sandbox.stub(game, 'advanceToNextPhase');

    game.begin()
      .then(() => {
        assert.equal(repositoryStub.callCount, 6);
        assert.equal(updateStub.callCount, 6);
        assert(updateStub.calledWith({status: "ALIVE"}));
        assert(gameStub.calledOnce);
        done();
      })
      .catch(done);
  });
})

describe('Game - game start', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('when game begins, players should be alive and game should advance to next phase', (done) => {
    var updateStub = sinon.spy();
    var offStub = sinon.spy();
    var repositoryStub = sandbox.stub(PlayerRepository, 'refPlayer')
      .returns({update: updateStub, off: offStub});

    const game = new Game();
    Object.assign(game, sixPlayers);
    var gameStub = sandbox.stub(game, 'advanceToNextPhase');

    game.begin()
      .then(() => {
        assert.equal(repositoryStub.callCount, 6);
        assert.equal(updateStub.callCount, 6);
        assert(updateStub.calledWith({status: "ALIVE"}));
        assert(gameStub.calledOnce);
        done();
      })
      .catch(done);
  });
})

describe('Game - round chaining', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('when game begins, we start first night', () => {
    const game = new Game();
    Object.assign(game, {});
    var firstNightStub = sandbox.stub(game, 'startFirstNight');

    game.advanceToNextPhase()
    assert(firstNightStub.calledOnce);
  });

  /*it('when current phase is a night, we should build a day', () => {
    // Stub archive
    // Stub victory conditions

    const game = new Game();
    Object.assign(game, {rounds: {current: {phase: {state: 'NIGHT'}}}});
    var startDayStub = sandbox.stub(game, 'startDay');

    game.advanceToNextPhase()
    assert(startDayStub.calledOnce);
  });*/
})
;
