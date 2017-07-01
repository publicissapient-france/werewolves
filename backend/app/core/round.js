const Phase = require('./phase');
const Player = require('./player');
const firebase = require('../services/firebase').getFirebaseClient();

class Round {
  constructor(data) {
    Object.assign(this, data);
  }

  refCurrentRound() {
    return firebase.database().ref(`games/${this.gameId}/rounds/current`);
  }

  refRound(number) {
    return firebase.database().ref(`games/${this.id}/rounds/${number}`);
  }

  createNextPhase() {
    if (this.NIGHT) {
      return new Phase({ state: 'DAY', subPhase: { state: 'VILLAGERS_VOTE' } });
    }
    return new Phase({ state: 'NIGHT', subPhase: { state: 'WEREWOLVES_VOTE' } });
  }

  createNewPhase() {
    return this.refCurrentRound().once('value')
    .then(result => this.refCurrentRound().update({ phase: new Round(result.val()).createNextPhase() }));
  }

  killPlayer(playerId) {
    return this.refCurrentRound().once('value')
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
    const ref = this.refCurrentRound();
    return ref.child('phase').once('value').then((result) => {
      const currentPhase = result.val();
      const jsonContent = {};
      jsonContent[currentPhase.state] = currentPhase;
      ref.update(jsonContent);
      return ref.child('phase').remove();
    });
  }

  archive() {
    return this.refCurrentRound().once('value')
    .then(currentRound => this.refRound(currentRound.val().number)
    .set(currentRound.val())
    .then(() => this.refCurrentRound().remove()));
  }
}

module.exports = Round;
