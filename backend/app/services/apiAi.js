const Game = require('../core/game');
const repository = require('../services/repository');


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

const buildWerewolvesVoteEndMessage = (killed, role) => {
  let message = startMessage();

  message = addSpeechToMessage(message, 'Werewolves made their choice. Werewolves, close your eyes.');
  message = addSpeechToMessage(message, `<break time="3" />`);
  message = addSpeechToMessage(message, 'The morning has come. Everybody should open their eyes');
  message = addSpeechToMessage(message, `<break time="3" />`);
  message = addSpeechToMessage(message, 'Everybody except');
  message = addSpeechToMessage(message, `<break time="1" />`);
  message = addSpeechToMessage(message, `${killed} who has been savagely slaughtered during the night.`);
  message = addSpeechToMessage(message, `<break time="1" />`);
  message = addSpeechToMessage(message, `He was a ${role}.`);
  message = addSpeechToMessage(message, `<break time="2" />`);
  message = addSpeechToMessage(message, `Who did it ? Villagers, defend yourselves ! Find the werewolves amongst you, and hang them ! Be wise.`);
  return endMessage(message);
}

const buildVillagersVoteEndMessage = (killed) => {
  let message = startMessage();

  message = addSpeechToMessage(message, 'Villagers made their choice.');
  message = addSpeechToMessage(message, `<break time="3" />`);
  message = addSpeechToMessage(message, `${killed} end up on the gallows.`);
  message = addSpeechToMessage(message, `<break time="1" />`);
  message = addSpeechToMessage(message, `He was a <break time="1" /> ${role}.`);
  message = addSpeechToMessage(message, `<break time="2" />`);
  message = addSpeechToMessage(message, `Night is falling. Everybody, please close your eyes`);
  return endMessage(message);
}

const resumeApp = (assistant) => {
  console.log('= Welcome action');
  Game.loadByDeviceId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    // Case WEREWOLVES vote completed
    if (game) {
      console.log(game.id, game.status)
    }
    if (game && game.id && game.status === 'WEREWOLVES_VOTE_COMPLETED') {
      console.log(game, game.lastEvent)
      assistant.tell(buildWerewolvesVoteEndMessage(game.lastEvent.death, game.lastEvent.role));
    } else if (game && game.id && game.status === 'VILLAGERS_VOTE_COMPLETED') {
      assistant.tell(buildVillagersVoteEndMessage(game.lastEvent.death, game.lastEvent.role));
    } else if (game && game.id && game.status !== 'END') {
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
    const gameId = game.id;
    console.log(`Display all players name for ${gameId}`);

    repository.getAllPlayers(gameId).then((players) => {
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

    message = addAudioToMessage(message, 'https://xebia-sandbox.appspot.com/static/wolves.mp3', 'wolves');

    message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[1].textToSpeech.replace('${pause}', '<break time="3" />'));

    message = endMessage(message);

    game.attachListenerForReadiness();

    assistant.tell(message);
  });
};

this.apiAiActionMap.set('WELCOME', resumeApp);
this.apiAiActionMap.set('CREATE_GAME', createGame);
this.apiAiActionMap.set('START_GAME', startGame);
this.apiAiActionMap.set('START_GAME_CONFIRMED', startGameIsConfirmed);
