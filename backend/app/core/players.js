const _ = require('lodash');
const Player = require('./player');

class Players {
  constructor(players) {
    this.players = _(players).map(p => new Player(p)).value();
  }

  getWinners() {
    if (this.getVillagers().length === 1) {
      return 'WEREWOLVES_VICTORY';
    }
    if (this.getWerewolves().length === 0) {
      return 'VILLAGERS_VICTORY';
    }
    return undefined;
  }

  getWerewolves() {
    return _(this.players).filter(player => player.isWerewolf()).value();
  }

  getVillagers() {
    return _(this.players).filter(player => player.isVillager()).value();
  }
}

module.exports = Players;
