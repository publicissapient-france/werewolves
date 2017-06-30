const cards = require('../rules/cards');
const firebase = require('./../services/firebase').getFirebaseClient();
const _ = require('lodash');
const moment = require('moment');

module.exports.associateUserIdToGame = (userId, gameId) =>
  firebase.database().ref().child('devices').child(userId).set({
    startDate: moment().format(),
    gameId,
    status: 'INITIAL'
  });

module.exports.getCurrentGame = (deviceId) =>
  firebase.database().ref(`devices/${deviceId}`).once('value').then((game) => {
    if (game && game.val()) {
      return game.val();
    }
    return null;
  });


module.exports.getGame = gameId =>
  firebase.database().ref(`games/${gameId}`).once('value').then((game) => game.val());

module.exports.createGame = (deviceId) => {
  const gameId = Math.floor(Math.random() * (9999 - 1000)) + 1000;
  const json = {};
  json[gameId] = {
    startDate: moment().format(),
    status: 'INITIAL',
    players: {},
    deviceId,
    roundNumber: 0
  };
  return firebase.database().ref().child('games').update(json).then(() => gameId);
};

Array.prototype.randsplice = function randsplice() {
  const ri = Math.floor(Math.random() * this.length);
  return this.splice(ri, 1);
};

module.exports.getAllPlayers = (gameId) => {
  return firebase.database().ref(`games/${gameId}/players`).once('value')
    .then((players) => {
      const allPlayers = [];
      for (const player in players.val()) {
        allPlayers.push(player);
      }
      return allPlayers;
    });
};

module.exports.distributeRoles = gameId => this.getAllPlayers(gameId).then((players) => {
  const updates = [];
  const roles = [...cards.distribution[players.length]];
  players.forEach((player) => {
    const role = roles.randsplice();
    updates.push(firebase.database().ref(`games/${gameId}/players/${player}`).update({role: role.toString()}));
  });
  updates.push(firebase.database().ref(`games/${gameId}`).update({nbPlayers: players.length}));
  return Promise.all(updates);
});
