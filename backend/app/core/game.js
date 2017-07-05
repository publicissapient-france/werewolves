const cards = require('../rules/cards');
const moment = require('moment');
const Player = require('./player');
const Votes = require('./votes');
const Players = require('./players');
const Round = require('./round');
const Phase = require('./phase');
const Promise = require('bluebird');
const repository = require('../services/repository');
const numbers = require('../utils/numbers');
const _ = require('lodash');

const firebase = require('../../app/services/firebase').getFirebaseClient();

Array.prototype.pickRandom = function pickRandom() {
  return this.splice(Math.floor(Math.random() * this.length), 1);
};

class Game {
  constructor(deviceId, gameId) {
    this.id = gameId || numbers.random();
    this.deviceId = deviceId;
  }

  // Only used for test purpose
  createPlayer(name) {
    console.log(`- Test purpose, should not appear in production - Creating player ${name}`)
    const player = new Player({deviceId: numbers.random(), name, gameId: this.id});
    return repository.updatePlayer(player);
  }

  // Only used for test purpose
  findKillable(role) {
    const killables = _(this.players).filter(p => p.role === role && p.status !== 'DEAD').value();
    if (killables.length > 0) {
      return killables[0].name;
    }
  };

  // Only used for test purpose
  werewolvesVote() {
    const waitTime = 0;
    const werewolves = _(this.players).filter(p => p.role === "WEREWOLF" && p.status !== 'DEAD').value();
    const villagerToKill = this.findKillable("VILLAGER");
    const promises = [];
    var i = 1;
    werewolves.forEach((werewolf) => {
      promises.push(new Promise((resolve) =>
        setTimeout(() =>
          firebase.database().ref().child(`games/${this.id}/rounds/current/phase/subPhase/votes/${werewolf.name}`).set({voted: `${villagerToKill}`})
            .then(() => resolve()), waitTime * i)))
      i++;
    });
    return Promise.all(promises);
  };

  // Only used for test purpose
  villagersVote(roleToKill) {
    const voters = _(this.players).filter(p => p.status !== 'DEAD').value();
    const killed = this.findKillable(roleToKill);
    const promises = [];
    voters.forEach((voter) => {
      promises.push(firebase.database().ref().child(`games/${this.id}/rounds/current/phase/subPhase/votes/${voter.name}`).set({voted: `${killed}`}))
    });
    return Promise.all(promises);
  };

  // Only used for test purpose
  setStatusAdvanceToNextPhase() {
    return repository.refGame(this.id).update({status: 'ADVANCE_TO_NEXT_PHASE'})
  };

  create() {
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
    return repository.getDevice(deviceId).then(device => {
      if (device && device.val()) {
        return this.loadById(device.val().gameId)
      }
      return null;
    });
  }

  static loadById(id) {
    return repository.getGame(id).then(game => {
      return Object.assign(new Game(game.val().deviceId, id), game.val())
    });
  }

  associateUserIdToGame() {
    return repository.getDevices().child(this.deviceId)
      .set({
        startDate: moment().format(),
        gameId: this.id,
        status: 'INITIAL',
      });
  }

  distributeRoles() {
    console.log('= Distributing roles');
    const players = _.keys(this.players);
    const roles = [...cards.distribution[players.length]];
    return Promise.mapSeries(players, player =>
        this.assignRole(player, roles.pickRandom().toString()))
      .then(() => repository.updatePlayerCount(this.id, players.length));
  }

  assignRole(player, role) {
    console.log(`= Assign role ${role} to ${player}`)
    return new Player({id: player, gameId: this.id}).assignRole(role);
  }

  attachListenerForStatus() {
    console.log('= Wait For Status to change ...');
    return new Promise((resolve, reject) => repository.refGame(this.id).child('status').on('value', this.onChangeStatus(resolve, reject)));
  }

  onChangeStatus() {
    console.log('= Attach listener on status for value change')
    return (childSnapshot) => {
      // Reloading the game is necessary
      if (childSnapshot.val() == "ADVANCE_TO_NEXT_PHASE") {
        return repository.getGame(this.id).then((_game) => {
          Object.assign(this, _game.val());
          repository.refGame(this.id).child('status').off();
          this.advanceToNextPhase();
        })
      }
    }
  }

  attachListenerForReadiness() {
    console.log('= Wait For Players To Be Ready ...');
    return new Promise((resolve, reject) => repository.refPlayers(this.id).on('value', this.onReady(resolve, reject)));
  }

  onReady() {
    console.log('= Attach listener on players for value change')
    return (childSnapshot) => {
      // Reloading the game is necessary
      return repository.getGame(this.id).then((_game) => {
        const nbPlayersToWaitFor = _game.val().nbPlayers;
        const players = new Players(_game.val().players);

        if (players.getReadyCount() == nbPlayersToWaitFor) {
          repository.refPlayers(this.id).off();
          console.log(`= Everybody is ready`);
          return this.begin();
        }
      });
    }
  }

  begin() {
    console.log('= Begin game');
    return Promise.mapSeries(_.keys(this.players), playerName => {
        console.log(`= ${playerName} is alive`);
        this.player(playerName).setAlive()
      })
      .then(() => repository.refPlayers(this.id).off())
      .then(() => this.advanceToNextPhase());
  }

  player(name) {
    return new Player({id: name, gameId: this.id});
  }

  advanceToNextPhase() {
    if (this.rounds) {
      return this.currentRound().archiveCurrentPhase().then(() =>
        this.getRoundEndMessage().then((endMessage) => {
          if (endMessage) {
            return this.endGame(endMessage);
          }
          const currentPhase = new Phase(this.rounds.current.phase);

          if (currentPhase.isDay()) {
            return this.startNight();
          }
          return this.startDay();
        }));
    }
    return this.startFirstNight();
  }

  startFirstNight() {
    return this.createNewRound().then(() => this.createNewPhase())
      .then(() => this.attachListenerForVotes('WEREWOLVES_VOTE'));
  }

  startDay() {
    return this.createNewPhase()
      .then(() => this.attachListenerForVotes('VILLAGERS_VOTE'));
  }

  startNight() {
    return this.currentRound().archive()
      .then(() => this.createNewRound())
      .then(round => round.createNewPhase(this.currentRound()))
      .then(() => this.attachListenerForVotes('WEREWOLVES_VOTE'));
  }

  endGame(endMessage) {
    console.log('= EndGame', endMessage);
    return this.currentRound().archive()
      .then(() => repository.updateGameStatus(this.id, endMessage)
        .then(() => repository.updateDeviceStatus(this.deviceId, endMessage)));
  }

  currentRound() {
    return new Round({gameId: this.id});
  }

  createNewRound() {
    return repository.getGame(this.id)
      .then((game) => {
        const roundNumber = parseInt(game.val().roundNumber, 10) + 1;
        console.log(`\n= Create New Round: ${roundNumber}`);
        return repository.updateRounds(this.id, {current: {number: roundNumber}})
          .then(() => repository.updateGame(this.id, {roundNumber, status: `ROUND_${roundNumber}`})
            .then(() => repository.updateDevice(this.deviceId, {status: `ROUND_${roundNumber}`})))
          .then(() => this.currentRound());
      });
  }

  createNewPhase() {
    // TODO here it is probably useless to reload rounds
    return repository.getCurrentRound(this.id)
      .then(result => repository.updateCurrentRound(this.id, {phase: new Round(result.val()).createNextPhase()}));
  }

  attachListenerForVotes(voteType) {
    return new Promise((resolve, reject) => repository.getCurrentSubPhase(this.id).on('child_added', this.onVotes(voteType, resolve, reject)));
  }

  attachListenerForVote(voteType) {
    return new Promise((resolve, reject) => repository.refCurrentVotes(this.id).on('value', this.onVote(voteType, resolve, reject)));
  }

  onVotes(voteType, resolve) {
    return (childSnapshot) => {
      if (childSnapshot.key === 'votes') {
        repository.getCurrentSubPhase(this.id).off();
        return resolve(this.attachListenerForVote(voteType));
      }
    };
  }

  onVote(voteType, resolve) {
    return (childSnapshot) => {
      repository.getGame(this.id).then((result) => {
        const votes = new Votes(result.val().rounds.current.phase.subPhase.votes);
        const players = new Players(result.val().players);
        // If vote is complete
        if (voteType == 'WEREWOLVES_VOTE' && votes.countVotes() == players.getAliveWerewolvesCount()) {
          // Remove listener
          repository.refCurrentVotes(this.id).off();
          const votesResults = votes.getMajority();
          console.log('= All werewolves voted', votesResults);
          if (votesResults.length != 1) {
            // TODO throw error : Mobile App should ensure that werewolves agree on a single name.
          }
          //@jsmadja to review
          // TODO find role
          this.killPlayer(votesResults[0])
            .then(() => repository.refGame(this.id).update({
              lastEvent: {
                death: votesResults[0],
                role: 'villager'
              }
            }))
            .then(() => repository.makeDeviceTalkToHome(this.id))
            .then(() => repository.updateDeviceStatus(this.deviceId, "WEREWOLVES_VOTE_COMPLETED"))
            .then(() => resolve(repository.updateGameStatus(this.id, "WEREWOLVES_VOTE_COMPLETED")))
            .then(() => this.attachListenerForStatus());
        } else if (voteType == 'VILLAGERS_VOTE' && votes.countVotes() == players.getAliveCount()) {
          repository.refCurrentVotes(this.id).off();
          const votesResults = votes.getMajority()
          console.log('= All villagers voted', votesResults);
          //@jsmadja to review
          this.killPlayer(votesResults[0])
            .then(() => repository.makeDeviceTalkToHome(this.id))
            .then(() => repository.updateDeviceStatus(this.deviceId, "VILLAGERS_VOTE_COMPLETED"))
            .then(() => resolve(repository.updateGameStatus(this.id, "VILLAGERS_VOTE_COMPLETED")))
            .then(() => this.attachListenerForStatus());
        }
      });
    };
  }

  killPlayer(playerId) {
    return repository.getCurrentSubPhase(this.id)
      .update({death: playerId})
      .then(() => this.currentRound().killPlayer(playerId));
  }

  getRoundEndMessage() {
    // TODO here it is probably useless to reload players
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

module
  .exports = Game;
