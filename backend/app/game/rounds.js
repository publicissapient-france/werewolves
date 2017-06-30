const conditions = require('./conditions');
const setup = require('./setup');
const firebase = require('./../services/firebase').getFirebaseClient();

module.exports.archiveCurrentRound = (gameId) => {
  console.log('archiveCurrentRound');
  const ref = firebase.database().ref(`games/${gameId}`);
  return ref.child('rounds/current').once('value').then((currentRound) => {
    const roundNumber = currentRound.val().number;
    // Archive the current round
    return ref.child(`rounds/${roundNumber}`).set(currentRound.val()).then(() => {
      return ref.child('rounds/current').remove();
    });
  });
};

module.exports.archiveCurrentPhase = (gameId) => {
  console.log('archiveCurrentPhase');
  const refPhase = firebase.database().ref(`games/${gameId}/rounds/current`);
  return refPhase.child('phase').once('value').then((result) => {
    if (result) {
      const currentPhase = result.val();
      const jsonContent = {};
      jsonContent[currentPhase.state] = currentPhase;
      refPhase.update(jsonContent);
      return refPhase.child('phase').remove();
    }
    return Promise.resolve();
  });
};

module.exports.createNewRound = (gameId) => {
  console.log('createNewRound');
  const refGame = firebase.database().ref(`games/${gameId}`);
  return refGame.once('value')
  .then((game) => {
    const roundNumber = parseInt(game.val().roundNumber, 10) + 1;
    return refGame.child('rounds').update({ current: { number: roundNumber } })
    .then(() =>
      refGame.update({ roundNumber })
      .then(() =>
        refGame.update({ status: `ROUND_${roundNumber}` })
        .then(() =>
          firebase.database().ref(`devices/${game.val().deviceId}`).update({ status: `ROUND_${roundNumber}` }))));
  });
};

module.exports.createNewPhase = (gameId) => {
  console.log('createNewPhase');
  const refPhase = firebase.database().ref(`games/${gameId}/rounds/current`);
  return refPhase.once('value').then((result) => {
    let json;
    if (result && result.val().NIGHT) {
      // create DAY phase
      json = { state: 'DAY', subPhase: { state: 'VILLAGERS_VOTE' } };
    } else {
      // create NIGHT phase
      json = { state: 'NIGHT', subPhase: { state: 'WEREWOLVES_VOTE' } };
    }
    return refPhase.update({ phase: json });
  });
};

module.exports.stateMachine = (gameId) => {
  return firebase.database().ref(`games/${gameId}`).once('value').then((game) => {
    if (game && game.val().rounds) {
      const currentPhase = game.val().rounds.current.phase;
      return this.archiveCurrentPhase(gameId).then(() => {
        // If current round contains 2 phases archive round and create new round and create new phase
        // If game is finished archive round
        return conditions.checkEndConditions(gameId).then((endMessage) => {
          if (endMessage) {
            return this.archiveCurrentRound(gameId)
            .then(() => firebase.database().ref(`games/${gameId}`).update({ status: endMessage })
            .then(() => firebase.database().ref(`devices/${game.val().deviceId}`).update({ status: endMessage })));
          }
          if (currentPhase && currentPhase.state === 'DAY') {
            return this.archiveCurrentRound(gameId).then(() => this.createNewRound(gameId).then(() => this.createNewPhase(gameId)));
          }
          return this.createNewPhase(gameId);
        });
      });
    }
    return this.createNewRound(gameId).then(() => this.createNewPhase(gameId));
  });
};

module.exports.attachListenerForDeath = (gameId) => {
  return new Promise((resolve, reject) => {
    console.log('attachListenerForDeath');
    const ref = firebase.database().ref(`games/${gameId}/rounds/current/phase/subPhase`);
    ref.on('child_added', (childSnapshot, prevChildKey) => {
      // Listen to a new event : 'death'
      if (childSnapshot.key === 'death') {
        // Kill player
        this.killPlayer(gameId, childSnapshot.val());
        // Remove listener on the specific node
        ref.off('child_added');
        // Advance to next phase
        return resolve(this.stateMachine(gameId).then(() => this.attachListenerForDeath(gameId)));
      }
      return resolve();
    });
  });
};

module.exports.killPlayer = (gameId, playerId) => {
  console.log('killPlayer');
  const ref = firebase.database().ref(`games/${gameId}/rounds/current`);
  return ref.once('value').then((currentRound) => {
    const refPlayer = firebase.database().ref(`games/${gameId}/players/${playerId}`);
    return refPlayer.update({
      status: 'DEAD',
      killedBy: currentRound.val().phase.subPhase.state,
      killedAt: `ROUND_${currentRound.val().number}`,
    });
  });
};

module.exports.waitForPlayersToBeReady = (gameId) => {
  console.log('waitForPlayersToBeReady');
  return firebase.database().ref(`games/${gameId}`).once('value').then((game) => {
    let nbPlayersToWaitFor = game.val().nbPlayers;
    firebase.database().ref(`games/${gameId}/players`).orderByChild('status').on('child_changed', (childSnapshot, prevChildKey) => {
      if (childSnapshot.val().status === 'READY') {
        nbPlayersToWaitFor--;
        if (nbPlayersToWaitFor <= 0) {
          return this.stateMachine(gameId).then(() => {
            firebase.database().ref(`games/${gameId}/players`).off();
            return this.attachListenerForDeath(gameId)
            .then(() =>
              setup.getAllPlayers(gameId).then((players) => {
                const updates = [];
                players.forEach(player => updates.push(firebase.database().ref(`games/${gameId}/players/${player}`).update({ status: 'ALIVE' })));
                return Promise.all(updates);
              }));
          });
        }
      }
      return Promise.resolve();
    });
  });
};

