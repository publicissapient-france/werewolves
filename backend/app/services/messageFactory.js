const _ = require('lodash');
const requireText = require('require-text');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const template = (file, variables) => _.template(requireText(`./messages/${file}`, require))(variables);

module.exports = {
  buildMessageFromApiAiUnchanged: messages =>
    template('message.xml', { content: _(messages).map(message => message.textToSpeech).join('') }),

  buildWerewolvesVoteEndMessage: (killed, role) =>
    template('werewolves_vote_end.xml', { killed, role }),

  buildVillagersVoteEndMessage: (killed, role) =>
    template('villagers_vote_end.xml', { killed, role }),

  buildStartGameConfirmedMessage: messages =>
    template('start_game_confirmed.xml', {
      textToSpeech1: messages[0].textToSpeech,
      textToSpeech2: messages[1].textToSpeech.replace('${pause}', '<break time="3" />'),
    }),

  buildStartGameMessage: (players, messages) => {
    let content = '';
    content += messages[0].textToSpeech.replace('$playersLength', players.length);
    players.forEach((player) => {
      content += `${player}<break time="1" />`;
    });
    content += messages[1].textToSpeech;
    return template('message.xml', { content });
  },

  newCreateMessage: (messages, id) => {
    const gameId = id.toString().split('').join(' <break time="1" />');
    const content = _(messages)
    .map(message => message.textToSpeech)
    .map(textToSpeech => textToSpeech.replace('$gameId', gameId))
    .join('');
    return template('message.xml', { content });
  },
};
