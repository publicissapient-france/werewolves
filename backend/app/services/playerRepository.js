const firebase = require('./firebase').getFirebaseClient();

const refPlayer = (gameId, player) => firebase.database().ref(`games/${gameId}/players/${player}`);

module.exports = {
  refPlayer,
};
