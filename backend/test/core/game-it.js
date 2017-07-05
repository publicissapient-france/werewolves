const Game = require('../../app/core/game');
const firebase = require('../../app/services/firebase').getFirebaseClient();
const _ = require('lodash');
const assert = require('assert');

const assertWon = (game, done, status) => {
  console.log(_.map(game.players, p => `${p.name}\t\t${p.role}\t${p.status}`).join('\n'));
  if (game.status === status) {
    console.log(game.status);
    done();
  } else {
    done(new Error(`${game.status} !== ${status}`));
  }
}

describe('Game', () => {
  const gamesToDelete = [];

  const initiateGame = (deviceId) => {
    return new Game(deviceId).create()
      .then((game) => {
        gamesToDelete.push(game.id);
        console.log(`= Game: ${game.id}`);
        return game.associateUserIdToGame()
          .then(() => Game.loadByDeviceId(deviceId))
          .then(() => game.createPlayer('julien_'))
          .then(() => game.createPlayer('jean_'))
          .then(() => game.createPlayer('qian_'))
          .then(() => game.createPlayer('benjamin_'))
          .then(() => game.createPlayer('pablo_'))
          .then(() => game.createPlayer('michael_'))
          // this reload correspond to what happens with mobile device.
          .then(() => Game.loadByDeviceId(deviceId))
          .then((reloadedGame) => reloadedGame.distributeRoles()
            .then(() => {
              reloadedGame.attachListenerForReadiness()
              firebase.database().ref().child(`games/${game.id}/players/pablo_`).update({status: 'READYX'})
              firebase.database().ref().child(`games/${game.id}/players/pablo_`).update({status: 'READY'})
              firebase.database().ref().child(`games/${game.id}/players/benjamin_`).update({status: 'READY'})
              firebase.database().ref().child(`games/${game.id}/players/qian_`).update({status: 'READY'})
              firebase.database().ref().child(`games/${game.id}/players/michael_`).update({status: 'READY'})
              firebase.database().ref().child(`games/${game.id}/players/julien_`).update({status: 'READY'})
              firebase.database().ref().child(`games/${game.id}/players/jean_`).update({status: 'READY'})
            }))
          .then(() => game);
      })
  }

  it('Villagers should win !', (done) => {
    const deviceId = 'test_1';

    initiateGame(deviceId).then((game) => {
        setTimeout(() => Game.loadByDeviceId(deviceId).then(_game => _game.werewolvesVote()), 2000);
        setTimeout(() => Game.loadByDeviceId(deviceId).then(_game => _game.setStatusAdvanceToNextPhase()), 4000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.villagersVote("WEREWOLF")), 6000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.setStatusAdvanceToNextPhase()), 8000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.werewolvesVote()), 10000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.setStatusAdvanceToNextPhase()), 12000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.villagersVote("WEREWOLF")), 14000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.setStatusAdvanceToNextPhase()), 16000);
        setTimeout(() => Game.loadById(game.id).then(_game => assertWon(_game, done, 'VILLAGERS_VICTORY')), 18000);
      })
      .catch(done);
  });

  it('Werewolves should win !', (done) => {
    const deviceId = 'test_2';
    initiateGame(deviceId).then((game) => {
        setTimeout(() => Game.loadById(game.id).then(_game => _game.werewolvesVote()), 2000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.setStatusAdvanceToNextPhase()), 4000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.villagersVote("VILLAGER")), 6000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.setStatusAdvanceToNextPhase()), 8000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.werewolvesVote()), 10000);
        setTimeout(() => Game.loadById(game.id).then(_game => _game.setStatusAdvanceToNextPhase()), 12000);
        setTimeout(() => Game.loadById(game.id).then(_game => assertWon(_game, done, 'WEREWOLVES_VICTORY')), 14000);
      })
      .catch(done);
  });

  after(() => {
    const promises = []
    gamesToDelete.forEach(
      gameId => promises.push(firebase.database().ref().child(`games/${gameId}`).remove())
    )
    promises.push(firebase.database().ref().child(`devices/test_1`).remove());
    promises.push(firebase.database().ref().child(`devices/test_2`).remove());
    return Promise.all(promises);
  });
})
;
