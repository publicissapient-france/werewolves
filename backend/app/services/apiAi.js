const Game = require('../core/game');
const repository = require('../services/repository');
const MessageFactory = require('./messageFactory');

const apiAiActionMap = new Map();

apiAiActionMap.set('WELCOME', (assistant) => {
  console.log('= Welcome action');
  return Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    if (game) {
      console.log(game.id, game.status);
    }
    if (game && game.werewolvesHaveVoted()) {
      console.log(game, game.lastEvent);
      return assistant.tell(MessageFactory.buildWerewolvesVoteEndMessage(game.lastEvent.death, game.lastEvent.role));
    }
    if (game && game.villagersHaveVoted()) {
      return assistant.tell(MessageFactory.buildVillagersVoteEndMessage(game.lastEvent.death, game.lastEvent.role));
    }
    if (game && game.isNotEnded()) {
      return assistant.ask(`Resuming message : game status is ${game.status}`);
    }
    const message = MessageFactory.buildMessageFromApiAiUnchanged(assistant.body_.result.fulfillment.messages);
    return assistant.ask(message);
  });
});

apiAiActionMap.set('CREATE_GAME', (assistant) => {
  console.log('Creating game');
  // TODO to be modified
  const userId = assistant.body_.originalRequest.data.user.userId;
  return new Game(userId).create().then((game) => {
    console.log('Game id is', game.id);
    const message = MessageFactory.newCreateMessage(assistant.body_.result.fulfillment.messages, game.id);
    game.associateUserIdToGame(assistant.body_.originalRequest.data.user.userId);
    assistant.tell(message);
  });
});

// TODO check that there is more than 6 players ? Mobile ?
apiAiActionMap.set('START_GAME', assistant =>
  Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    const gameId = game.id;
    console.log(`Display all players name for ${gameId}`);
    repository.getAllPlayers(gameId).then((players) => {
      const message = MessageFactory.buildStartGameMessage(players, assistant.body_.result.fulfillment.messages);
      assistant.ask(message);
    });
  }));


apiAiActionMap.set('START_GAME_CONFIRMED', (assistant) => {
  console.log('START_GAME_CONFIRMED');
  return Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    game.distributeRoles();
    const message = MessageFactory.buildStartGameConfirmedMessage(assistant.body_.result.fulfillment.messages);
    game.attachListenerForReadiness();
    assistant.tell(message);
  });
});

module.exports = apiAiActionMap;
