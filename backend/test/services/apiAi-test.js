const sinon = require('sinon');
const proxyquire = require('proxyquire');
const assert = require('assert');

const Repository = sinon.stub();

const Game = proxyquire('../../app/core/game', {
  '../services/repository': Repository,
});

const game = new Game(
  {
    players:
      {
        A: { name: 'A' },
        B: { name: 'B' },
        C: { name: 'C' },
        D: { name: 'D' },
        E: { name: 'E' },
      },
  });


sinon.stub(Game, 'loadByDeviceId').callsFake(() => Promise.resolve(game));
sinon.stub(Repository, 'updateGames').callsFake(() => Promise.resolve());
sinon.stub(Repository, 'getDevices').callsFake(() => ({
  child: () => ({
    set: () => ({}),
  }),
}));
sinon.stub(Repository, 'getAllPlayers').callsFake(() => Promise.resolve(['A', 'B', 'C', 'D', 'E']));

const apiAiActionMap = proxyquire('../../app/services/apiAi', {
  '../core/game': Game,
  '../services/repository': Repository,
});

let assistant;

beforeEach(() => {
  assistant = {
    body_: {
      originalRequest: {
        data: {
          user: {
            userId: 1,
          },
        },
      },
      result: {
        fulfillment: {
          messages: [
            { textToSpeech: 'Speech1' },
            { textToSpeech: 'Speech2' },
          ],
        },
      },
    },
    ask: sinon.spy(),
    tell: sinon.spy(),
  };
});

describe('apiAi [WELCOME]', () => {
  it('should resume game', () => apiAiActionMap.get('WELCOME')(assistant)
  .then(() => assert(assistant.ask.calledWith(`Resuming message : game status is ${game.status}`))));

  it('should buildWerewolvesVoteEndMessage', () => {
    game.status = 'WEREWOLVES_VOTE_COMPLETED';
    game.lastEvent = {
      death: 'bob',
      role: 'VILLAGER',
    };
    return apiAiActionMap.get('WELCOME')(assistant)
    .then(() =>
      assert(assistant.tell.calledWith(
        '<speak>Werewolves made their choice. Werewolves, close your eyes.<break time="3" />The morning has come. Everybody should open their eyes<break time="3" />Everybody except<break time="1" />bob who has been savagely slaughtered during the night.<break time="1" />He was a VILLAGER.<break time="2" />Who did it ? Villagers, defend yourselves ! Find the werewolves amongst you, and hang them ! Be wise.</speak>')));
  });

  it('should buildVillagersVoteEndMessage', () => {
    game.status = 'VILLAGERS_VOTE_COMPLETED';
    game.lastEvent = {
      death: 'bob',
      role: 'WEREWOLF',
    };
    return apiAiActionMap.get('WELCOME')(assistant)
    .then(() =>
      assert(assistant.tell.calledWith(
        '<speak>Villagers made their choice.<break time="3" />bob end up on the gallows.<break time="1" />He was a <break time="1" /> ${role}.<break time="2" />Night is falling. Everybody, please close your eyes</speak>')));
  });

  it('should end game', () => {
    game.status = 'END';
    return apiAiActionMap.get('WELCOME')(assistant)
    .then(() => assert(assistant.ask.calledWith('<speak>Speech1Speech2</speak>')));
  });
});

describe('apiAi [START_GAME_CONFIRMED]', () => {
  it('should start game', () => {
    game.status = 'END';
    return apiAiActionMap.get('START_GAME_CONFIRMED')(assistant)
    .then(() => assert(assistant.tell.calledWith('<speak>Speech1<audio src="https://xebia-sandbox.appspot.com/static/wolves.mp3">wolves</audio>Speech2</speak>')));
  });
});

describe('apiAi [CREATE_GAME]', () => {
  it('should create game', () => apiAiActionMap.get('CREATE_GAME')(assistant)
  .then(() => assert(assistant.tell.calledWith('<speak>Speech1Speech2</speak>'))));
});

describe('apiAi [START_GAME]', () => {
  it('should buildWerewolvesVoteEndMessage', () => {
    return apiAiActionMap.get('START_GAME')(assistant)
    .then(() =>
      assert(assistant.ask.calledWith('<speak>Speech1A<break time="1" />B<break time="1" />C<break time="1" />D<break time="1" />E<break time="1" />Speech2</speak>')));
  });
});
