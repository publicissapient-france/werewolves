'use strict';

const conditions = require('./conditions');
const setup = require('./setup');
const firebase = require('./../services/firebase').getFirebaseClient();

module.exports.archiveCurrentRound = (gameId) => {
  console.log('archiveCurrentRound');
  const ref = firebase.database().ref(`games/${gameId}`);
  return ref.child('rounds/current').once('value').then((currentRound) => {
    var roundNumber = currentRound.val().number;
    // Archive the current round
    return ref.child(`rounds/${roundNumber}`).set(currentRound.val()).then(() => {
      return ref.child('rounds/current').remove();
    })
  })
};

module.exports.archiveCurrentPhase = (gameId) => {
  console.log('archiveCurrentPhase');
  const refPhase = firebase.database().ref(`games/${gameId}/rounds/current`);
  return refPhase.child('phase').once('value').then((result) => {
    if (result) {
      const currentPhase = result.val();
      const jsonContent = {}
      jsonContent[currentPhase.state] = currentPhase;
      refPhase.update(jsonContent);
      return refPhase.child('phase').remove();
    }
  })
};

module.exports.createNewRound = (gameId) => {
  console.log('createNewRound');
  const refGame = firebase.database().ref(`games/${gameId}`);
  return refGame.once('value').then((game) => {

    const roundNumber = parseInt(game.val().roundNumber) + 1;


    // Call create new phase.
    return refGame.child('rounds').update({
      current: {
        number: roundNumber
      }
    }).then(() => {
      return refGame.update({roundNumber: roundNumber}).then(() => {
        return refGame.update({status: "ROUND_" + roundNumber}).then(() => {
          return firebase.database().ref(`devices/${game.val().deviceId}`).update({status: "ROUND_" + roundNumber})
        });
      })
    });

  });
};

module.exports.createNewPhase = (gameId) => {
  console.log('createNewPhase');
  const refPhase = firebase.database().ref(`games/${gameId}/rounds/current`);
  return refPhase.once('value').then((result) => {
    var json;
    if (result && result.val().NIGHT) {
      // create DAY phase
      json = {state: "DAY", subPhase: {state: "VILLAGERS_VOTE"}}
    } else {
      // create NIGHT phase
      json = {state: "NIGHT", subPhase: {state: "WEREWOLVES_VOTE"}}
    }
    return refPhase.update({phase: json})
  });
};

module.exports.stateMachine = (gameId) => {
  return firebase.database().ref(`games/${gameId}`).once('value').then((game) => {
    console.log(game.val());
    if (game && game.val().rounds) {
      const currentPhase = game.val().rounds.current.phase
      return this.archiveCurrentPhase(gameId).then(() => {
        // If current round contains 2 phases archive round and create new round and create new phase
        // If game is finished archive round
        conditions.checkEndConditions(gameId).then((endMessage) => {
          if (endMessage) {
            return this.archiveCurrentRound(gameId).then(() => {
              // Update states
              return game.update({status: endMessage}).then(() => {
                return firebase.database().ref(`devices/${game.deviceId}`).update({status: endMessage})
              })
            });
          } else {
            if (currentPhase && currentPhase.state == "DAY") {
              this.archiveCurrentRound(gameId).then(() => {
                this.createNewRound(gameId).then(() => {
                  return this.createNewPhase(gameId);
                })
              })
            } else {
              return this.createNewPhase(gameId);
            }
          }
        })
      })
    } else {
      return this.createNewRound(gameId).then(() => {
        return this.createNewPhase(gameId);
      })
    }
  })
};

module.exports.attachListenerForDeath = (gameId) => {
  console.log("attachListenerForDeath");
  const ref = firebase.database().ref(`games/${gameId}/rounds/current/phase/subPhase`);
  return ref.on('child_added', (childSnapshot, prevChildKey) => {
    console.log(childSnapshot.key);
    // Listen to a new event : "death"
    if (childSnapshot.key == "death") {
      // Kill player
      this.killPlayer(gameId, childSnapshot.val());
      // Remove listener on the specific node
      ref.off('child_added');
      // Advance to next phase
      return this.stateMachine(gameId).then(() => {
        // Reattach the listener to the new current node
        return this.attachListenerForDeath(gameId);
      })
    }
  });
};

module.exports.killPlayer = (gameId, playerId) => {
  console.log("killPlayer");
  const ref = firebase.database().ref(`games/${gameId}/rounds/current`);
  ref.once('value').then((currentRound) => {
    const refPlayer = firebase.database().ref(`games/${gameId}/players/${playerId}`);
    refPlayer.update({
      status: "DEAD",
      killedBy: currentRound.val().phase.subPhase.state,
      killedAt: "ROUND_" + currentRound.val().number
    })
  });
};

module.exports.waitForPlayersToBeReady = (gameId) => {
  console.log("waitForPlayersToBeReady");
  firebase.database().ref(`games/${gameId}`).once('value').then((game) => {
    var nbPlayersToWaitFor = game.val().nbPlayers;
    firebase.database().ref(`games/${gameId}/players`).orderByChild('status').on('child_changed', (childSnapshot, prevChildKey) => {
      if (childSnapshot.val().status == "READY") {
        nbPlayersToWaitFor--;
        if (nbPlayersToWaitFor == 0) {
          return this.stateMachine(gameId).then(() => {
            firebase.database().ref(`games/${gameId}/players`).off();
            this.attachListenerForDeath(gameId);
            return setup.getAllPlayers(gameId).then((players) => {
              const updates = [];
              players.forEach((player) => {
                updates.push(firebase.database().ref(`games/${gameId}/players/${player}`).update({status: "ALIVE"}));
              });
              updates.push(firebase.database().ref(`games/${gameId}`).set({nbPlayers: players.length}));
              return Promise.all(updates)
            });

          })
        }
      }
    })
  })
};

