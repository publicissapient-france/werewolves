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

Array.prototype.pickRandom = function pickRandom() {
  return this.splice(Math.floor(Math.random() * this.length), 1);
};

class Game {
  constructor(deviceId) {
    this.id = Math.floor(Math.random() * (9999 - 1000)) + 1000;
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
    return firebase.database().ref().child('games').update(json)
      .then(() => this);
  }

  static loadByDeviceId(deviceId) {
    return firebase.database().ref(`devices/${deviceId}`).once('value').then(game => Object.assign(new Game(), game.val()));
  }

  static loadById(id) {
    return firebase.database().ref(`games/${id}`).once('value').then(game => Object.assign(new Game(), game.val()));
  }

  associateUserIdToGame() {
    return firebase.database().ref().child('devices').child(this.deviceId)
      .set({
        startDate: moment().format(),
        gameId: this.id,
        status: 'INITIAL',
      });
  }

  createPlayer(name) {
    return firebase.database().ref().child(`games/${this.id}/players/${name}`)
      .update(new Player({
        deviceId: this.deviceId,
        name,
      }));
  }

  getAllPlayers() {
    return this.refPlayers().once('value')
      .then(players => _.keys(players.val()));
  }

  refPlayers() {
    return firebase.database().ref(`games/${this.id}/players`);
  }

  refGame() {
    return firebase.database().ref(`games/${this.id}`);
  }

  refDevice() {
    return firebase.database().ref(`devices/${this.deviceId}`);
  }

  refCurrentRound() {
    return firebase.database().ref(`games/${this.id}/rounds/current`);
  }

  refCurrentSubPhase() {
    return firebase.database().ref(`games/${this.id}/rounds/current/phase/subPhase`);
  }

  refCurrentVotes() {
    return firebase.database().ref(`games/${this.id}/rounds/current/phase/subPhase/votes`);
  }

  distributeRoles() {
    return this.getAllPlayers()
      .then((players) => {
        const roles = [...cards.distribution[players.length]];
        return Promise.mapSeries(players, player =>
            this.assignRole(player, roles.pickRandom().toString()))
          .then(() => this.updatePlayerCount(players.length));
      });
  }

  updatePlayerCount(nbPlayers) {
    return this.refGame().update({nbPlayers});
  }

  assignRole(player, role) {
    return new Player({id: player, gameId: this.id}).assignRole(role);
  }

  waitForPlayersToBeReady() {
    console.log('= Wait For Players To Be Ready ...');
    return this.refGame().once('value').then((_game) => {
      let nbPlayersToWaitFor = _game.val().nbPlayers;
      this.refPlayers().orderByChild('status').on('child_changed', (childSnapshot) => {
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
      .then(() => this.refPlayers().off())
      .then(() => Promise.mapSeries(this.getAllPlayers(), playerName => this.player(playerName).setAlive()))
      .then(() => this.attachListenerForVotes());
  }

  player(name) {
    return new Player({id: name, gameId: this.id});
  }

  advanceToNextPhase() {
    return this.refGame().once('value').then((game) => {
      if (game.val().rounds) {
        return this.currentRound().archiveCurrentPhase().then(() =>
          this.checkEndConditions().then((endMessage) => {
            if (endMessage) {
              return this.currentRound().archive()
                .then(() => this.refGame().update({status: endMessage})
                  .then(() => this.refDevice().update({status: endMessage})));
            }
            const currentPhase = new Phase(game.val().rounds.current.phase);
            if (currentPhase.isDay()) {
              return this.currentRound().archive()
                .then(() => this.createNewRound())
                .then(round => round.createNewPhase());
            }
            return this.createNewPhase();
          }));
      }
      return this.createNewRound()
        .then(() => this.createNewPhase());
    });
  }

  currentRound() {
    return new Round({gameId: this.id});
  }

  createNewRound() {
    return this.refGame().once('value')
      .then((game) => {
        const roundNumber = parseInt(game.val().roundNumber, 10) + 1;
        console.log(`\n= Create New Round: ${roundNumber}`);
        return this.refGame().child('rounds').update({current: {number: roundNumber}})
          .then(() => this.refGame().update({roundNumber, status: `ROUND_${roundNumber}`})
            .then(() => this.refDevice().update({status: `ROUND_${roundNumber}`})))
          .then(() => this.currentRound());
      });
  }

  createNewPhase() {
    return this.refCurrentRound().once('value')
      .then(result => this.refCurrentRound().update({phase: new Round(result.val()).createNextPhase()}));
  }

  attachListenerForDeath() {
    return new Promise((resolve, reject) => this.refCurrentSubPhase().on('child_added', this.onDeath(resolve, reject)));
  }

  attachListenerForVotes() {
    return new Promise((resolve, reject) => this.refCurrentSubPhase().on('child_added', this.onVotes(resolve, reject)));
  }

  attachListenerForWerewolvesVote() {
    return new Promise((resolve, reject) => this.refCurrentVotes().on('child_added', this.onWerewolvesVote(resolve, reject)));
  }

  // TO_BE_REVIEWED @jsmadja
  onVotes(resolve, reject) {
    return (childSnapshot) => {
      if (childSnapshot.key === 'votes') {
        // Move reference
        this.refCurrentVotes().off();
        // TODO indirection between Wolves and Villagers votes.
        return resolve(this.attachListenerForWerewolvesVote())
      }
    };
  }

  onWerewolvesVote(resolve, reject) {
    return (childSnapshot) => {
      if (childSnapshot.hasChild('voted')) {
        console.log("***", childSnapshot.child('voted').val())
        this.refGame().once('value').then((result) => {
          const votes = new Votes(result.val().rounds.current.phase.subPhase.votes)
          const players = new Players(result.val().players)
          console.log(votes.countVotes(), players.getWerewolvesCount());
          votes.getMajority()
        });
        return resolve();
      }
    };
  }

  onDeath(resolve, reject) {
    return (childSnapshot) => {
      if (childSnapshot.key === 'death') {
        const playerId = childSnapshot.val();
        this.killPlayer(playerId)
          .then(() => {
            this.refCurrentSubPhase().off('child_added');
            return resolve(this.advanceToNextPhase().then(() => this.attachListenerForDeath()));
          })
          .catch(reject);
      }
      return resolve();
    };
  }

  killPlayer(playerId) {
    return this.currentRound().killPlayer(playerId);
  }

  checkEndConditions() {
    return this.refPlayers().orderByChild('status').equalTo('ALIVE').once('value')
      .then(result => new Players(result.val()).getWinners());
  }
}

module.exports = Game;
