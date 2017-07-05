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

  getAliveCount() {
    return _(this.players).filter(player => player.isAlive()).value().length;
  }

  getReadyCount() {
    return _(this.players).filter(player => player.isReady()).value().length;
  }

  getAliveWerewolvesCount() {
    return _(this.players).filter(player => player.isAliveWerewolf()).value().length;
  }

  findKillable(role) {
    const killables = _(this.players).filter(p => p.role === role && p.status !== 'DEAD').value();
    if (killables.length > 0) {
      return killables[0].name;
    }
  };
}

module.exports = Players;
