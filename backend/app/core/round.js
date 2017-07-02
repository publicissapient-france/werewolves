const Phase = require('./phase');
const Player = require('./player');
const firebase = require('../services/firebase').getFirebaseClient();
const repository = require('../services/repository');

class Round {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  createNextPhase() {
    if (this.NIGHT) {
      console.log('= Create New Phase DAY');
      return new Phase({ state: 'DAY', subPhase: { state: 'VILLAGERS_VOTE' } });
    }
    console.log('= Create New Phase NIGHT');
    return new Phase({ state: 'NIGHT', subPhase: { state: 'WEREWOLVES_VOTE' } });
  }

  createNewPhase() {
    return repository.getCurrentRound(this.gameId)
    .then(result => repository.updateCurrentRound(this.gameId, { phase: new Round(result.val()).createNextPhase() }));
  }

  killPlayer(playerId) {
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
    const ref = repository.refCurrentRound(this.gameId);
    return ref.child('phase').once('value').then((result) => {
      const currentPhase = result.val();
      const jsonContent = {};
      jsonContent[currentPhase.state] = currentPhase;
      ref.update(jsonContent);
      return ref.child('phase').remove();
    });
  }

  archive() {
    return repository.getCurrentRound(this.gameId)
    .then(currentRound => repository.refRound(currentRound.val().number)
    .set(currentRound.val())
    .then(() => repository.refCurrentRound(this.gameId).remove()));
  }
}

module.exports = Round;
