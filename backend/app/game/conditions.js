const firebase = require('./../services/firebase').getFirebaseClient();
const Players = require('../core/players');

module.exports = {
  checkEndConditions: (gameId) => {
    const ref = firebase.database().ref(`games/${gameId}/players`);
    return ref.orderByChild('status').equalTo('ALIVE').once('value')
    .then((result) => Promise.resolve(new Players(result.val()).getWinners()));
  }
};
