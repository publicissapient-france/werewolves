// Helpers
const addSpeechToMessage = (message, speech) => message + speech;
const addAudioToMessage = (message, audioUrl, audioSpeech) => `${message}<audio src="${audioUrl}">${audioSpeech}</audio>`;
const startMessage = () => '<speak>';
const endMessage = message => `${message}</speak>`;

module.exports = {
  buildMessageFromApiAiUnchanged: (messages) => {
    let message = startMessage();
    messages.forEach((messageFromAi) => {
      if (messageFromAi.textToSpeech) {
        console.log('Handling ', messageFromAi.textToSpeech);
        message = addSpeechToMessage(message, messageFromAi.textToSpeech);
      }
    });
    message = endMessage(message);
    return message;
  },

  buildWerewolvesVoteEndMessage: (killed, role) => {
    let message = startMessage();

    message = addSpeechToMessage(message, 'Werewolves made their choice. Werewolves, close your eyes.');
    message = addSpeechToMessage(message, '<break time="3" />');
    message = addSpeechToMessage(message, 'The morning has come. Everybody should open their eyes');
    message = addSpeechToMessage(message, '<break time="3" />');
    message = addSpeechToMessage(message, 'Everybody except');
    message = addSpeechToMessage(message, '<break time="1" />');
    message = addSpeechToMessage(message, `${killed} who has been savagely slaughtered during the night.`);
    message = addSpeechToMessage(message, '<break time="1" />');
    message = addSpeechToMessage(message, `He was a ${role}.`);
    message = addSpeechToMessage(message, '<break time="2" />');
    message = addSpeechToMessage(message, 'Who did it ? Villagers, defend yourselves ! Find the werewolves amongst you, and hang them ! Be wise.');
    return endMessage(message);
  },

  buildVillagersVoteEndMessage: (killed, role) => {
    let message = startMessage();

    message = addSpeechToMessage(message, 'Villagers made their choice.');
    message = addSpeechToMessage(message, '<break time="3" />');
    message = addSpeechToMessage(message, `${killed} end up on the gallows.`);
    message = addSpeechToMessage(message, '<break time="1" />');
    message = addSpeechToMessage(message, 'He was a <break time="1" /> ${role}.');
    message = addSpeechToMessage(message, '<break time="2" />');
    message = addSpeechToMessage(message, 'Night is falling. Everybody, please close your eyes');
    return endMessage(message);
  },

  buildStartGameConfirmedMessage: (messages) => {
    let message = startMessage();
    message = addSpeechToMessage(message, messages[0].textToSpeech);
    message = addAudioToMessage(message, 'https://xebia-sandbox.appspot.com/static/wolves.mp3', 'wolves');
    message = addSpeechToMessage(message, messages[1].textToSpeech.replace('${pause}', '<break time="3" />'));
    message = endMessage(message);
    return message;
  },

  buildStartGameMessage: (players, messages) => {
    let message = startMessage();
    message = addSpeechToMessage(message, messages[0].textToSpeech.replace('$playersLength', players.length));
    console.log(`Adding players : ${message}`);
    players.forEach((player) => {
      console.log('Handling ', player);
      message = addSpeechToMessage(message, `${player}<break time="1" />`);
    });
    message = addSpeechToMessage(message, messages[1].textToSpeech);
    message = endMessage(message);
    console.log(message);
    return message;
  },

  newCreateMessage: (messages, id) => {
    let message = startMessage();
    messages.forEach((messageFromAi) => {
      if (messageFromAi.textToSpeech) {
        console.log('Handling ', messageFromAi.textToSpeech);
        const addition = messageFromAi.textToSpeech.replace('$gameId', id.toString().split('').join(' <break time="1" />'));
        message = addSpeechToMessage(message, addition);
      }
    });
    message = endMessage(message);
    return message;
  },
};
