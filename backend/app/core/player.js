const repository = require('../services/playerRepository');

class Player {
  constructor(data = {name: '', deviceId: '', gameId: ''}) {
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

  isAliveWerewolf() {
    return this.isWerewolf() && this.isAlive();
  }

  isReady() {
    return this.status === 'READY';
  }

  isAlive() {
    return this.status === 'ALIVE';
  }

  setAlive() {
    return repository.refPlayer(this.gameId, this.id).update({status: 'ALIVE'});
  }

  kill(killedBy, killedAt) {
    console.log(`= ${this.id} killed by ${killedBy} on ${killedAt}`);
    return repository.refPlayer(this.gameId, this.id)
      .update({
        status: 'DEAD',
        killedBy,
        killedAt,
      });
  }

  assignRole(role) {
    return repository.refPlayer(this.gameId, this.id).update({role});
  }
}

module.exports = Player;
