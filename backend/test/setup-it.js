const Setup = require('../app/game/setup');
const Round = require('../app/game/rounds');
const firebase = require('../app/services/firebase').getFirebaseClient();
const _ = require('lodash');
const assert = require('assert');

const createPlayer = (gameId, deviceId, name) =>
  firebase.database().ref().child(`games/${gameId}/players/${name}`).update({deviceId, name});

const kill = (gameId, players, role) => {
  const killables = _(players).filter(p => p.role === role && p.status !== 'DEAD').value();
  if (killables.length > 0) {
    const death = killables[0].name;
    return firebase.database().ref().child(`games/${gameId}/rounds/current/phase/subPhase`).update({death});
  }
  return Promise.resolve();
};

const assertWon = (game, done, status) => {
  console.log(_.map(game.players, p => `${p.name}\t\t${p.role}\t${p.status}`).join('\n'));
  if (game.status === status) {
    console.log('\n' + game.status);
    done();
  } else {
    done(new Error(`${game.status} !== ${status}`));
  }
};

describe('Games', () => {

  let gamesToDelete = [];

  it('Villagers should win !', (done) => {
    const deviceId = 'test_1';
    let gameId;
    Setup.createGame(deviceId)
      .then((_gameId) => {
        gameId = _gameId;
        gamesToDelete.push(gameId)
        console.log(`= Game: ${gameId}`);
        return Setup.associateUserIdToGame(deviceId, gameId);
      })
      .then(() => Setup.getCurrentGame(deviceId))
      .then(() => createPlayer(gameId, deviceId, 'julien_'))
      .then(() => createPlayer(gameId, deviceId, 'qian_'))
      .then(() => createPlayer(gameId, deviceId, 'benjamin_'))
      .then(() => createPlayer(gameId, deviceId, 'pablo_'))
      .then(() => createPlayer(gameId, deviceId, 'michael_'))
      .then(() => Setup.distributeRoles(gameId))
      .then(() => Round.waitForPlayersToBeReady(gameId))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo_`).update({status: 'READYX'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo_`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/benjamin_`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/qian_`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/michael_`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/julien_`).update({status: 'READY'}))
      .then(() => {
        setTimeout(() => Setup.getGame(gameId).then(game => kill(gameId, game.players, 'WEREWOLF')), 2000);
        setTimeout(() => Setup.getGame(gameId).then(game => kill(gameId, game.players, 'WEREWOLF')), 4000);
        setTimeout(() => Setup.getGame(gameId).then(game => kill(gameId, game.players, 'VILLAGER')), 6000);
        setTimeout(() => Setup.getGame(gameId).then(game => assertWon(game, done, 'VILLAGERS_VICTORY')), 8000);
      })
      .catch(done)
  });

  it('Werewolves should win !', (done) => {
    const deviceId = 'test_2';
    let gameId;
    Setup.createGame(deviceId)
      .then((_gameId) => {
        gameId = _gameId;
        gamesToDelete.push(gameId)
        console.log(`= Game: ${gameId}`);
        return Setup.associateUserIdToGame(deviceId, gameId);
      })
      .then(() => Setup.getCurrentGame(deviceId))
      .then(() => createPlayer(gameId, deviceId, 'julien'))
      .then(() => createPlayer(gameId, deviceId, 'qian'))
      .then(() => createPlayer(gameId, deviceId, 'benjamin'))
      .then(() => createPlayer(gameId, deviceId, 'pablo'))
      .then(() => createPlayer(gameId, deviceId, 'michael'))
      .then(() => Setup.distributeRoles(gameId))
      .then(() => Round.waitForPlayersToBeReady(gameId))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo`).update({status: 'READYX'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/benjamin`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/qian`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/michael`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${gameId}/players/julien`).update({status: 'READY'}))
      .then(() => {
        setTimeout(() => Setup.getGame(gameId).then(game => kill(gameId, game.players, 'VILLAGER')), 2000);
        setTimeout(() => Setup.getGame(gameId).then(game => kill(gameId, game.players, 'WEREWOLF')), 4000);
        setTimeout(() => Setup.getGame(gameId).then(game => kill(gameId, game.players, 'VILLAGER')), 6000);
        setTimeout(() => Setup.getGame(gameId).then(game => kill(gameId, game.players, 'VILLAGER')), 8000);
        setTimeout(() => Setup.getGame(gameId).then(game => assertWon(game, done, 'WEREWOLVES_VICTORY')), 10000);
      })
      .catch(done)
  });

  after(function () {
    gamesToDelete.forEach((gameId) => {
      firebase.database().ref().child(`games/${gameId}`).remove()
    });
    firebase.database().ref().child(`devices/test_1`).remove();
    firebase.database().ref().child(`devices/test_2`).remove();
  });


});
