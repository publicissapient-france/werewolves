const firebase = require('../services/firebase').getFirebaseClient();

class Player {
  constructor(data) {
    Object.assign(this, data);
  }

  hasRole(role) {
    return this.role === role;
  }

  isVillager() {
    return this.hasRole('VILLAGER');
  }

  isWerewolf() {
    return this.hasRole('WEREWOLF');
  }

  isReady() {
    return this.status === 'READY';
  }

  setAlive() {
    return firebase.database().ref(`games/${this.gameId}/players/${this.id}`).update({ status: 'ALIVE' });
  }

  kill(killedBy, killedAt) {
    console.log(`= Kill Player: ${this.id}`);
    return firebase.database().ref(`games/${this.gameId}/players/${this.id}`)
    .update({
      status: 'DEAD',
      killedBy,
      killedAt,
    });
  }

  assignRole(role) {
    return firebase.database().ref(`games/${this.gameId}/players/${this.id}`).update({ role });
  }
}

module.exports = Player;
