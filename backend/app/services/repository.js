const firebase = require('./firebase').getFirebaseClient();
const Players = require('../core/players');
const _ = require('lodash');

//
// Refs
//
const refPlayers = gameId => firebase.database().ref(`games/${gameId}/players`);
const refGame = gameId => firebase.database().ref(`games/${gameId}`);
const refDevice = deviceId => firebase.database().ref(`devices/${deviceId}`);
const refCurrentRound = gameId => firebase.database().ref(`games/${gameId}/rounds/current`);
const refCurrentSubPhase = gameId => firebase.database().ref(`games/${gameId}/rounds/current/phase/subPhase`);
const refRound = (gameId, number) => firebase.database().ref(`games/${this.gameId}/rounds/${number}`);
const getRandomPlayer = (gameId) =>
  refPlayers(gameId)
    .once('value')
    .then(players => {
      return players.val()[_.keys(players.val())[_.random(0, _.keys(players.val()).length - 1)]]
    });


module.exports = {

  //
  // Players
  //
  getAlivePlayers: gameId =>
    refPlayers(gameId)
      .orderByChild('status')
      .equalTo('ALIVE')
      .once('value')
      .then(result => new Players(result.val())),

  updatePlayerCount: (gameId, nbPlayers) => refGame(gameId).update({nbPlayers}),

  getAllPlayers: gameId =>
    refPlayers(gameId)
      .once('value')
      .then(players => _.keys(players.val())),

  getPlayersOrderByStatus: gameId =>
    refPlayers(gameId).orderByChild('status'),

  refPlayers,

  updatePlayer: player =>
    firebase.database().ref().child(`games/${player.gameId}/players/${player.name}`)
      .update(player),

  //
  // Games
  //
  getGame: gameId => refGame(gameId).once('value'),

  updateGameStatus: (gameId, status) =>
    refGame(gameId).update({status}),

  updateGame: (gameId, values) =>
    refGame(gameId).update(values),

  updateGames: values => firebase.database().ref().child('games').update(values),

  //
  // Devices
  //
  updateDevice: (deviceId, values) =>
    refDevice(deviceId).update(values),

  updateDeviceStatus: (deviceId, status) =>
    refDevice(deviceId).update({status}),


  makeDeviceTalkToHome: (gameId) =>
    getRandomPlayer(gameId).then((player)=>
      refGame(gameId).update({
        speak: {
          deviceId: player.deviceId,
          textToSpeech: "Ok Google... Talk to Werewolves"
        }
      })),

  getDevice: deviceId => firebase.database().ref(`devices/${deviceId}`).once('value'),

  getDevices: () => firebase.database().ref().child('devices'),

  //
  // Rounds
  //
  updateRounds: (gameId, values) =>
    refGame(gameId).child('rounds').update(values),

  getCurrentRound: gameId => refCurrentRound(gameId).once('value'),

  updateCurrentRound: (gameId, values) => refCurrentRound(gameId).update(values),

  getCurrentSubPhase: gameId => refCurrentSubPhase(gameId),

  refCurrentSubPhase,
  refCurrentRound,
  refRound,
  refGame,

  //
  // Votes
  //
  refCurrentVotes: gameId => firebase.database().ref(`games/${gameId}/rounds/current/phase/subPhase/votes`),
};
