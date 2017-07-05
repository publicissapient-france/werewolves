const Phase = require('./phase');
const Player = require('./player');
const firebase = require('../services/firebase').getFirebaseClient();
const repository = require('../services/repository');

class Round {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  createNextPhase() {
    if (this.phase && this.phase.state === 'NIGHT') {
      console.log('= Create New Phase DAY');
      return new Phase({state: 'DAY', subPhase: {state: 'VILLAGERS_VOTE'}});
    }
    console.log('= Create New Phase NIGHT');
    return new Phase({state: 'NIGHT', subPhase: {state: 'WEREWOLVES_VOTE'}});
  }

  createNewPhase() {
    repository.updateCurrentRound(this.gameId, {phase: this.createNextPhase()})
  };

  killPlayer(playerId, currentRound) {
    // TODO here it is probably useless to reload rounds
    // TODO not that simple
    return repository.getCurrentRound(this.gameId)
      .then((currentRound) => {
        const killedBy = currentRound.val().phase.subPhase.state;
        const killedAt = `ROUND_${currentRound.val().number}`;
        return new Player({
          id: playerId,
          gameId: this.gameId,
        }).kill(killedBy, killedAt);
      });
  }

  archiveCurrentPhase() {
    console.log(`= Archive phase ${this.phase.state}`)
    const ref = repository.refCurrentRound(this.gameId);
    const currentPhase = this.phase;
    const jsonContent = {};
    jsonContent[this.phase.state] = currentPhase;
    ref.update(jsonContent);
    return ref.child('phase').remove();
  }

  archive() {
    this[this.phase.state] = this.phase;
    this.phase = null
    firebase.database().ref(`games/${this.gameId}/rounds/${this.number}`).set({NIGHT: this.NIGHT, DAY: this.DAY})
    // BUGGED @jsmadja
    // repository.refRound(this.gameId, currentRound.val().number).set(currentRound.val())
    // TODO also remove in the object
    return repository.refCurrentRound(this.gameId).remove();
  }
}

module.exports = Round;
