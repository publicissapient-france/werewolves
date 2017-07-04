const Game = require('../app/core/game');
const firebase = require('../app/services/firebase').getFirebaseClient();

const addAllPlayers = (deviceId) => {
  return Game.loadByDeviceId(deviceId)
    .then((game) => game.createPlayer('julien')
      .then(() => game.createPlayer('jean'))
      .then(() => game.createPlayer('qian'))
      .then(() => game.createPlayer('benjamin'))
      .then(() => game.createPlayer('pablo'))
      .then(() => game.createPlayer('michael')))
    .then(() => console.log('Players created'))
};

const setAllPlayerReady = (deviceId) => {
  return Game.loadByDeviceId(deviceId)
    .then((game) => firebase.database().ref().child(`games/${game.id}/players/pablo`).update({status: 'READY'})
      .then(() => firebase.database().ref().child(`games/${game.id}/players/benjamin`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/qian`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/michael`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/julien`).update({status: 'READY'}))
      .then(() => firebase.database().ref().child(`games/${game.id}/players/jean`).update({status: 'READY'})))
    .then(() => console.log('Players ready'))
};

const makeWerewolvesVote = (deviceId) => {
  return Game.loadByDeviceId(deviceId)
    .then((game) => game.werewolvesVote())
    .then(() => console.log('WerewolvesVote complete'))
};

const makeVillagersVote = (deviceId, role) => {
  return Game.loadByDeviceId(deviceId)
    .then((game) => game.villagersVote(role))
    .then(() => console.log('VillagersVote complete'))
};

module.exports = {addAllPlayers, setAllPlayerReady, makeWerewolvesVote, makeVillagersVote};