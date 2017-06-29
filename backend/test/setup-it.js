const Setup = require('../app/game/setup');
const Round = require('../app/game/rounds');
const firebase = require('../app/services/firebase').getFirebaseClient();

const createPlayer = (gameId, deviceId, name) =>
  firebase.database().ref().child(`games/${gameId}/players/${name}`).update({ deviceId, name });

describe('setup', () => {
  it('should do everything', (done) => {
    const deviceId = '1';
    let gameId;
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
    .then(() => Setup.distributeRoles(gameId))
    .then(() => Round.waitForPlayersToBeReady(gameId))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo`).update({ status: 'READYX' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/pablo`).update({ status: 'READY' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/benjamin`).update({ status: 'READY' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/qian`).update({ status: 'READY' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/julien`).update({ status: 'READYX' }))
    .then(() => firebase.database().ref().child(`games/${gameId}/players/julien`).update({ status: 'READY' }))
    .then(() => setTimeout(done, 10000))
    .catch(done);
  });
});
