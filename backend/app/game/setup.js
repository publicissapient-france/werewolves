const gameUtils = require('./../utils/gameUtils');
const cards = require('./../rules/cards');
const firebase = require('./../services/firebase').getFirebaseClient();

const moment = require('moment');

module.exports.createGame = () => {
  const gameId = Math.floor(Math.random() * (9999 - 1000)) + 1000;
  return firebase.database().ref().child('games').child(gameId).set({
    startDate: moment().format(),
    status: "INITIAL",
    players: {}
  }).then(() => {
    return gameId;
  })
};

Array.prototype.randsplice = function randsplice() {
  const ri = Math.floor(Math.random() * this.length);
  const rs = this.splice(ri, 1);
  return rs;
};

module.exports.getAllPlayers = (gameId) => {
  return firebase.database().ref(`games/${gameId}/players`).once('value').then((players) => {
    const allPlayers = []
    for (player in players.val()) {
      allPlayers.push(player)
    }
    return allPlayers;
  })
};


Array.prototype.randsplice = function () {
  var ri = Math.floor(Math.random() * this.length);
  var rs = this.splice(ri, 1);
  return rs;
}

module.exports.distributeRoles = (gameId) => {
  return this.getAllPlayers(gameId).then((players) => {
    const updates = [];
    const roles = cards.distribution[players.length];
    players.forEach((player) => {
      const role = roles.randsplice();
      updates.push(firebase.database().ref(`games/${gameId}/players/${player}`).update({role: role.toString()}))
      console.log(player, role)
    })
    return Promise.all(updates)
  });
};

