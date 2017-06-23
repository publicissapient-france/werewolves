'use strict';
const firebase = require('./../services/firebase').getFirebaseClient();

module.exports.checkEndConditions = (gameId) => {
  console.log('checkEndConditions');
  var ref = firebase.database().ref(`games/${gameId}/players`);
  var villagersAlive = 0;
  var werewolvesAlive = 0;
  return ref.orderByChild('status').equalTo('ALIVE').once('value').then((result) => {
    const allAlive = result.val();
    for (var alive in allAlive) {
      if (allAlive[alive].role == "WEREWOLF") {
        werewolvesAlive++;
      } else if (allAlive[alive].role == "VILLAGER") {
        villagersAlive++;
      }
    }

    if (villagersAlive == 1) {
      console.log("Werewolves victory");
      return Promise.resolve("WEREWOLVES_VICTORY");
    } else if (werewolvesAlive == 0) {
      console.log("Villagers victory");
      return Promise.resolve("VILLAGERS_VICTORY");
    }
    return Promise.resolve(null);
  })
};

