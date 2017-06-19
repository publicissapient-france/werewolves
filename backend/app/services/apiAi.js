const gameSetup = require('../game/setup');

module.exports.apiAiActionMap = new Map();

// Helpers
const addSpeechToMessage = (message, speech) => message + speech;
const addAudioToMessage = (message, audioUrl, audioSpeech) => `${message}<audio src="${audioUrl}">${audioSpeech}</audio>`;
const startMessage = () => '<speak>';
const endMessage = message => `${message}</speak>`;

const resumeApp = (assistant) => {
  console.log('Welcome action');
  console.log('User id', assistant.body_.originalRequest.data.user.userId);
  gameSetup.getGameId(assistant.body_.originalRequest.data.user.userId).then((game) => {
    if (game.gameId && game.status != "END") {
      assistant.ask(`Resuming message : game status is ${game.status}`);
    } else {
      let message = startMessage();
      const messages = assistant.body_.result.fulfillment.messages;
      messages.forEach((messageFromAi) => {
        if (messageFromAi.textToSpeech) {
          console.log('Handling ', messageFromAi.textToSpeech);
          message = addSpeechToMessage(message, messageFromAi.textToSpeech);
        }
      });
      message = endMessage(message);
      assistant.ask(message)
    }
  });
};

const createGame = (assistant) => {
  console.log('Creating game');
  gameSetup.createGame().then((id) => {
    const uuid = id;

    let message = startMessage();
    const messages = assistant.body_.result.fulfillment.messages;
    messages.forEach((messageFromAi) => {
      if (messageFromAi.textToSpeech) {
        console.log('Handling ', messageFromAi.textToSpeech);
        const addition = messageFromAi.textToSpeech.replace('$gameId', uuid.toString().split('').join(' <break time="1" />'));
        message = addSpeechToMessage(message, addition);
      }
    });
    message = endMessage(message);
    console.log(`Game id is ${uuid}`);

    gameSetup.associateUserIdToGameId(assistant.body_.originalRequest.data.user.userId, uuid)
    assistant.tell(message);
  });
};

const startGame = (assistant) => {
  gameSetup.getGameId(assistant.body_.originalRequest.data.user.userId).then((gameId) => {
    console.log(`Display all players name for ${gameId}`);

    const players = gameSetup.getAllPlayers(gameId).then((players) => {

      var message = startMessage();

      message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[0].textToSpeech.replace("$playersLength", players.length));
      console.log(`Adding players : ${message}`);

      players.forEach((player) => {
        console.log("Handling ", player);
        message = addSpeechToMessage(message, player + '<break time="1" />');
      });
      message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[1].textToSpeech);

      message = endMessage(message);
      console.log(message);
      assistant.ask(message);
    });
  });
};

const startGameIsConfirmed = (assistant) => {
  console.log("START_GAME_CONFIRMED");
  gameSetup.getGameId(assistant.body_.originalRequest.data.user.userId).then((gameId) => {

    gameSetup.distributeRoles(gameId);
    assistant.tell("Confirmed")
  })
};

this.apiAiActionMap.set('WELCOME', resumeApp);
this.apiAiActionMap.set('CREATE_GAME', createGame);
this.apiAiActionMap.set('START_GAME', startGame);
this.apiAiActionMap.set('START_GAME_CONFIRMED', startGameIsConfirmed);
