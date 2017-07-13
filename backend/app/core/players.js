const _ = require('lodash');
const Player = require('./player');

class Players {
  constructor(players = []) {
    this.players = _(players).map(p => new Player(p)).value();
  }

  getWerewolves() {
    return _(this.players).filter(player => player.isWerewolf()).value();
  }

  getVillagers() {
    return _(this.players).filter(player => player.isVillager()).value();
  }

  getAlive() {
    return _(this.players).filter(player => player.isAlive()).value();
  }

  getReadyCount() {
    return _(this.players).filter(player => player.isReady()).value().length;
  }

  getAliveWerewolves() {
    return _(this.players).filter(player => player.isAliveWerewolf()).value();
  }

  findKillable(role) {
    const killables = _(this.players).filter(p => p.role === role && p.status !== 'DEAD').value();
    if (killables.length > 0) {
      return killables[0].name;
    }
  }
}

module.exports = Players;
