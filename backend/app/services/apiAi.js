const gameSetup = require('../game/setup');

module.exports.apiAiActionMap = new Map();

const addSpeechToMessage = (message, speech) => message + speech;

const addAudioToMessage = (message, audioUrl, audioSpeech) => `${message}<audio src="${audioUrl}">${audioSpeech}</audio>`;

const startMessage = () => '<speak>';

const endMessage = message => `${message}</speak>`;

const createGame = (assistant) => {
  console.log('Creating game');
  const uuid = gameSetup.createGame();

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
  console.log(message);

  assistant.tell(message);
};

this.apiAiActionMap.set('CREATE_GAME', createGame);

const startGame = (assistant) => {
    console.log("Display player name")
    console.log(assistant.body_.result.fulfillment)
    const players = gameSetup.getAllPlayers("test")
    var message = startMessage()
    message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[0].textToSpeech.replace("$playersLength", players.length))
    players.forEach((player) => {
        console.log("Handling ", player)
        message = addSpeechToMessage(message, player + ' <break time="1" />')
    })
    message = addSpeechToMessage(message, assistant.body_.result.fulfillment.messages[1].textToSpeech)

    message = endMessage(message)
    console.log(message)
    assistant.ask(message)
}

this.apiAiActionMap.set('START_GAME', startGame);

const startGameIsConfirmed = (assistant) => {
    console.log("START_GAME_CONFIRMED")
    assistant.tell("Confirmed")
}

this.apiAiActionMap.set('START_GAME_CONFIRMED', startGameIsConfirmed);
