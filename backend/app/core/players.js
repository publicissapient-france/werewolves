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
}

module.exports = Players;
