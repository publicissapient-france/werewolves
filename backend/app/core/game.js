const cards = require('../rules/cards');
const firebase = require('../services/firebase').getFirebaseClient();
const _ = require('lodash');
const moment = require('moment');
const Player = require('./player');
const Votes = require('./votes');
const Players = require('./players');
const Round = require('./round');
const Phase = require('./phase');
const Promise = require('bluebird');
const repository = require('../services/repository');
const numbers = require('../utils/numbers');

Array.prototype.pickRandom = function pickRandom() {
  return this.splice(Math.floor(Math.random() * this.length), 1);
};

class Game {
  constructor(deviceId) {
    this.id = numbers.random();
    this.deviceId = deviceId;
  }

  start() {
    const json = {};
    json[this.id] = {
      startDate: moment().format(),
      status: 'INITIAL',
      players: {},
      deviceId: this.deviceId,
      roundNumber: 0,
    };
    return repository.updateGames(json)
    .then(() => this);
  }

  static loadByDeviceId(deviceId) {
    return repository.getDevice(deviceId).then(device => Object.assign(new Game(), device.val()));
  }

  static loadById(id) {
    return repository.getGame(id).then(game => Object.assign(new Game(), game.val()));
  }

  associateUserIdToGame() {
    return repository.getDevices().child(this.deviceId)
    .set({
      startDate: moment().format(),
      gameId: this.id,
      status: 'INITIAL',
    });
  }

  createPlayer(name) {
    const player = new Player({ deviceId: this.deviceId, name, gameId: this.id });
    return repository.updatePlayer(player);
  }

  distributeRoles() {
    return repository.getAllPlayers(this.id)
    .then((players) => {
      const roles = [...cards.distribution[players.length]];
      return Promise.mapSeries(players, player =>
        this.assignRole(player, roles.pickRandom().toString()))
      .then(() => repository.updatePlayerCount(this.id, players.length));
    });
  }

  assignRole(player, role) {
    return new Player({ id: player, gameId: this.id }).assignRole(role);
  }

  waitForPlayersToBeReady() {
    console.log('= Wait For Players To Be Ready ...');
    return repository.getGame(this.id).then((_game) => {
      let nbPlayersToWaitFor = _game.val().nbPlayers;
      repository.getPlayersOrderByStatus(this.id).on('child_changed', (childSnapshot) => {
        const player = new Player(childSnapshot.val());
        if (player.isReady()) {
          console.log(`= ${player.name} (${player.role}) is ready`);
          nbPlayersToWaitFor--;
          if (nbPlayersToWaitFor <= 0) {
            return this.begin();
          }
        }
        return Promise.resolve();
      });
    });
  }

  begin() {
    return this.advanceToNextPhase()
    .then(() => repository.refPlayers(this.id).off())
    .then(() => Promise.mapSeries(repository.getAllPlayers(this.id), playerName => this.player(playerName).setAlive()))
    .then(() => this.attachListenerForVotes());
  }

  player(name) {
    return new Player({ id: name, gameId: this.id });
  }

  advanceToNextPhase() {
    return repository.getGame(this.id).then((game) => {
      if (game.val().rounds) {
        return this.currentRound().archiveCurrentPhase().then(() =>
          this.getRoundEndMessage().then((endMessage) => {
            if (endMessage) {
              return this.endGame(endMessage);
            }
            const currentPhase = new Phase(game.val().rounds.current.phase);
            if (currentPhase.isDay()) {
              return this.startNight();
            }
            return this.startDay();
          }));
      }
      return this.startFirstNight();
    });
  }

  startFirstNight() {
    return this.createNewRound().then(() => this.createNewPhase());
  }

  startDay() {
    return this.createNewPhase();
  }

  startNight() {
    return this.currentRound().archive()
    .then(() => this.createNewRound())
    .then(round => round.createNewPhase());
  }

  endGame(endMessage) {
    return this.currentRound().archive()
    .then(() => repository.updateGameStatus(this.id, endMessage)
    .then(() => repository.updateDeviceStatus(this.deviceId, endMessage)));
  }

  currentRound() {
    return new Round({ gameId: this.id });
  }

  createNewRound() {
    return repository.getGame(this.id)
    .then((game) => {
      const roundNumber = parseInt(game.val().roundNumber, 10) + 1;
      console.log(`\n= Create New Round: ${roundNumber}`);
      return repository.updateRounds(this.id, { current: { number: roundNumber } })
      .then(() => repository.updateGame(this.id, { roundNumber, status: `ROUND_${roundNumber}` })
      .then(() => repository.updateDevice(this.deviceId, { status: `ROUND_${roundNumber}` })))
      .then(() => this.currentRound());
    });
  }

  createNewPhase() {
    return repository.getCurrentRound(this.id)
    .then(result => repository.updateCurrentRound(this.id, { phase: new Round(result.val()).createNextPhase() }));
  }

  attachListenerForDeath() {
    return new Promise((resolve, reject) =>
      repository.getCurrentSubPhase(this.id).on('child_added', this.onDeath(resolve, reject)));
  }

  attachListenerForVotes() {
    return new Promise((resolve, reject) => repository.getCurrentSubPhase(this.id).on('child_added', this.onVotes(resolve, reject)));
  }

  attachListenerForWerewolvesVote() {
    return new Promise((resolve, reject) => repository.refCurrentVotes(this.id).on('child_added', this.onWerewolvesVote(resolve, reject)));
  }

  attachListenerForVillagersVote() {
    return new Promise((resolve, reject) => repository.refCurrentVotes(this.id).on('child_added', this.onWerewolvesVote(resolve, reject)));
  }

  // TO_BE_REVIEWED @jsmadja
  onVotes(resolve) {
    return (childSnapshot) => {
      if (childSnapshot.key === 'votes') {
        // Move reference
        repository.refCurrentVotes(this.id).off();
        // TODO indirection between Wolves and Villagers votes.
        return resolve(this.attachListenerForWerewolvesVote());
      }
    };
  }

  onWerewolvesVote(resolve) {
    return (childSnapshot) => {
      if (childSnapshot.hasChild('voted')) {
        return repository.getGame(this.id).then((game) => {
          const votes = new Votes(game.val().rounds.current.phase.subPhase.votes);
          const players = new Players(game.val().players);
          // If vote is complete
          // TODO debug : looks like it is called twice
          if (votes.countVotes() === players.getWerewolvesCount()) {
            const votesResults = votes.getMajority();
            console.log('= All werewolves voted', votesResults);
            if (votesResults.length !== 1) {
              // TODO throw error : Mobile App should ensure that werewolves agree on a single name.
            }
            return this.killPlayer(votesResults[0]).then(() =>
              resolve(this.advanceToNextPhase().then(() => this.attachListenerForVotes())));
          }
        });
      }
      return resolve();
    };
  }

  onDeath(resolve, reject) {
    return (childSnapshot) => {
      if (childSnapshot.key === 'death') {
        const playerId = childSnapshot.val();
        this.killPlayer(playerId)
        .then(() => {
          repository.getCurrentSubPhase(this.id).off('child_added');
          return resolve(this.advanceToNextPhase().then(() => this.attachListenerForDeath()));
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
      }
      return resolve();
    };
  }

  killPlayer(playerId) {
    return repository.getCurrentSubPhase(this.id)
    .update({ death: playerId })
    .then(() => this.currentRound().killPlayer(playerId));
  }

  getRoundEndMessage() {
    return repository.getAlivePlayers(this.id)
    .then((players) => {
      if (players.getVillagers().length === 1) {
        return 'WEREWOLVES_VICTORY';
      }
      if (players.getWerewolves().length === 0) {
        return 'VILLAGERS_VICTORY';
      }
      return undefined;
    });
  }
}

module.exports = Game;
