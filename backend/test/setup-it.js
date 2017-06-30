const Setup = require('../app/game/setup');
const Round = require('../app/game/rounds');
const firebase = require('../app/services/firebase').getFirebaseClient();
const _ = require('lodash');

const createPlayer = (gameId, deviceId, name) =>
  firebase.database().ref().child(`games/${gameId}/players/${name}`).update({ deviceId, name });

const kill = (gameId, players, role) => {
  const killables = _(players).filter(p => p.role === role && p.status !== 'DEAD').value();
  if (killables.length > 0) {
    const death = killables[0].name;
    console.log(`Killing ${death} (${role})`);
    return firebase.database().ref().child(`games/${gameId}/rounds/current/phase/subPhase`).update({ death });
  }
  return Promise.resolve();
};

describe('setup', () => {
  it('should do everything', (done) => {
    const deviceId = '1';
    let gameId;
    let players;
    Setup.createGame(deviceId)
    .then((_gameId) => {
      gameId = _gameId;
      console.log(gameId);
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
    .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo`).update({ status: 'READYX' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo`).update({ status: 'READY' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/benjamin`).update({ status: 'READY' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/qian`).update({ status: 'READY' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/michael`).update({ status: 'READY' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/julien`).update({ status: 'READYX' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/julien`).update({ status: 'READY' }))
    .then(() => Setup.getGame(gameId))
    .then((game) => {
      setTimeout(() => kill(gameId, game.players, 'VILLAGER'), 2000);
      setTimeout(() => kill(gameId, game.players, 'WEREWOLF'), 4000);
      setTimeout(() => kill(gameId, game.players, 'VILLAGER'), 6000);
    })
    .catch(done);
  });
});
