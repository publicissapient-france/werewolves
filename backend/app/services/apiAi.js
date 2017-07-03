const Game = require('../core/game');

module.exports.apiAiActionMap = new Map();

// Helpers
const addSpeechToMessage = (message, speech) => message + speech;
const addAudioToMessage = (message, audioUrl, audioSpeech) => `${message}<audio src="${audioUrl}">${audioSpeech}</audio>`;
const startMessage = () => '<speak>';
const endMessage = message => `${message}</speak>`;

const buildMessageFromApiAiUnchanged = (messages) => {
  let message = startMessage();
  messages.forEach((messageFromAi) => {
    if (messageFromAi.textToSpeech) {
      console.log('Handling ', messageFromAi.textToSpeech);
      message = addSpeechToMessage(message, messageFromAi.textToSpeech);
    }
  });
  message = endMessage(message);
  return message;
};

const resumeApp = (assistant) => {
  console.log('Welcome action');
  console.log('User id', assistant.body_.originalRequest.data.user.userId);
  Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    if (game && game.gameId && game.status !== 'END') {
      assistant.ask(`Resuming message : game status is ${game.status}`);
    } else {
      const message = buildMessageFromApiAiUnchanged(assistant.body_.result.fulfillment.messages);
      assistant.ask(message);
    }
  });
};

function newCreateMessage(assistant, id) {
  let message = startMessage();
  const messages = assistant.body_.result.fulfillment.messages;
  messages.forEach((messageFromAi) => {
      if (messageFromAi.textToSpeech) {
        console.log('Handling ', messageFromAi.textToSpeech);
        const addition = messageFromAi.textToSpeech.replace('$gameId', id.toString().split('').join(' <break time="1" />'));
        message = addSpeechToMessage(message, addition);
      }
    });
  message = endMessage(message);
  return message;
}

function getUserId(assistant) {
  return assistant.body_.originalRequest.data.user.userId;
}

const createGame = (assistant) => {
  console.log('Creating game');
  new Game(getUserId(assistant)).create().then((game) => {
    console.log('Game id is', game.id);
    const message = newCreateMessage(assistant, game.id);
    game.associateUserIdToGame(getUserId(assistant));
    assistant.tell(message);
  });
};

const startGame = (assistant) => {
  // TODO check that there is more than 6 players ? Mobile ?
  Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    const gameId = game.gameId;
    console.log(`Display all players name for ${gameId}`);

    game.getAllPlayers().then((players) => {
      let message = startMessage();

      message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[0].textToSpeech.replace('$playersLength', players.length));
      console.log(`Adding players : ${message}`);

      players.forEach((player) => {
        console.log('Handling ', player);
        message = addSpeechToMessage(message, `${player}<break time="1" />`);
      });
      message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[1].textToSpeech);
      message = endMessage(message);
      console.log(message);
      assistant.ask(message);
    });
  });
};

const startGameIsConfirmed = (assistant) => {
  console.log('START_GAME_CONFIRMED');
  Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    game.distributeRoles();

    let message = startMessage();
    message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[0].textToSpeech);
    message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[1].textToSpeech);

    message = addAudioToMessage(message, 'https://xebia-sandbox.appspot.com/static/wolves.mp3', 'wolves');

    message = endMessage(message);

    game.waitForPlayersToBeReady();

    assistant.tell(message);
  });
};

this.apiAiActionMap.set('WELCOME', resumeApp);
this.apiAiActionMap.set('CREATE_GAME', createGame);
this.apiAiActionMap.set('START_GAME', startGame);
this.apiAiActionMap.set('START_GAME_CONFIRMED', startGameIsConfirmed);
