const Game = require('../core/game');
const repository = require('../services/repository');
const MessageFactory = require('./messageFactory');

module.exports.apiAiActionMap = new Map();

const resumeApp = (assistant) => {
  console.log('= Welcome action');
  return Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    // Case WEREWOLVES vote completed
    if (game) {
      console.log(game.id, game.status);
    }
    if (game && game.id && game.status === 'WEREWOLVES_VOTE_COMPLETED') {
      console.log(game, game.lastEvent);
      assistant.tell(MessageFactory.buildWerewolvesVoteEndMessage(game.lastEvent.death, game.lastEvent.role));
    } else if (game && game.id && game.status === 'VILLAGERS_VOTE_COMPLETED') {
      assistant.tell(MessageFactory.buildVillagersVoteEndMessage(game.lastEvent.death, game.lastEvent.role));
    } else if (game && game.id && game.status !== 'END') {
      assistant.ask(`Resuming message : game status is ${game.status}`);
    } else {
      const message = MessageFactory.buildMessageFromApiAiUnchanged(assistant.body_.result.fulfillment.messages);
      assistant.ask(message);
    }
  });
};

const createGame = (assistant) => {
  console.log('Creating game');
  // TODO to be modified
  const userId = assistant.body_.originalRequest.data.user.userId;
  return new Game(userId).create().then((game) => {
    console.log('Game id is', game.id);
    const message = MessageFactory.newCreateMessage(assistant.body_.result.fulfillment.messages, game.id);
    game.associateUserIdToGame(assistant.body_.originalRequest.data.user.userId);
    assistant.tell(message);
  });
};

// TODO check that there is more than 6 players ? Mobile ?
const startGame = assistant =>
  Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    const gameId = game.id;
    console.log(`Display all players name for ${gameId}`);
    repository.getAllPlayers(gameId).then((players) => {
      const message = MessageFactory.buildStartGameMessage(players, assistant.body_.result.fulfillment.messages);
      assistant.ask(message);
    });
  });

const startGameIsConfirmed = (assistant) => {
  console.log('START_GAME_CONFIRMED');
  return Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    game.distributeRoles();
    const message = MessageFactory.buildStartGameConfirmedMessage(assistant.body_.result.fulfillment.messages);
    game.attachListenerForReadiness();
    assistant.tell(message);
  });
};

this.apiAiActionMap.set('WELCOME', resumeApp);
this.apiAiActionMap.set('CREATE_GAME', createGame);
this.apiAiActionMap.set('START_GAME', startGame);
this.apiAiActionMap.set('START_GAME_CONFIRMED', startGameIsConfirmed);

module.exports = this.apiAiActionMap;
