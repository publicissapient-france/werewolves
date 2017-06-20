const gameUtils = require('./../utils/gameUtils');
const firebase = require('./../services/firebase').getFirebaseClient();

module.exports.goToNextRound = (gameId) => {
  console.log("goToNextRound")
  const ref = firebase.database().ref(`games/${gameId}`);
  return ref.child('currentRound').once('value').then((currentRound) => {
      var roundNumber = 0;
      if (currentRound && currentRound.val()) {
        console.log(currentRound.val())
        roundNumber = currentRound.val().roundNumber;
        ref.child("ROUND_" + roundNumber).set(currentRound.val())
        //ref.child('currentRound').remove()
      }

      ref.update({status: "ROUND_" + (parseInt(roundNumber) + 1)})
      ref.child('currentRound').set({
        roundNumber: roundNumber + 1,
        currentPhase: {phaseState: "NIGHT", currentSubPhase: {subPhaseState: "WEREWOLVES_VOTE"}}
      });
      console.log("return goToNextRound");

      ref.once('value').then((game) => {
        const deviceId = game.val().deviceId;
        return firebase.database().ref(`devices/${deviceId}`).update({status: "ROUND_" + (parseInt(roundNumber) + 1)})
      })
    }
  )
};

module.exports.goToNextPhase = (gameId) => {
  console.log("goToNextPhase")
  const ref = firebase.database().ref(`games/${gameId}/currentRound`);
  return ref.child('currentPhase').once('value').then((currentPhase) => {
      if (currentPhase && currentPhase.val()) {
        if (currentPhase.val().phaseState == "NIGHT") {
          ref.update({night: currentPhase.val()})
          return ref.child('currentPhase').set({phaseState: "DAY", currentSubPhase: {subPhaseState: "VILLAGERS_VOTE"}});
        } else {
          ref.update({day: currentPhase.val()})
          ref.child('currentPhase').remove()
          return this.goToNextRound(gameId)
        }
      }
    }
  )
};

module.exports.attachListenerForDeath = (gameId) => {
  console.log("attachListenerForDeath")
  const ref = firebase.database().ref(`games/${gameId}/currentRound/currentPhase/currentSubPhase`);
  ref.on('child_added', (childSnapshot, prevChildKey) => {
    console.log(childSnapshot.key)
    if (childSnapshot.key == "death") {
      ref.off('child_added')
      this.goToNextPhase(gameId).then(() => {
        this.attachListenerForDeath(gameId);
      })
    }
  });
}
