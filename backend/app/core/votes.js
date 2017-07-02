const _ = require('lodash');

const votesEqualTo = maxVotes => player => player.votes === maxVotes;

const toTarget = target =>
  ({
    player: target[0].voted,
    votes: target.length,
  });

class Votes {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  countVotes() {
    return _.keys(this).length;
  }

  getMajority() {
    const killables =
      _(this).valuesIn()
      .groupBy('voted')
      .map(toTarget)
      .orderBy('votes', 'desc')
      .value();
    if (killables.length === 0) {
      return [];
    }
    const playersToKill = _(killables).filter(votesEqualTo(killables[0].votes)).map('player').value();
    console.log('= Here are the vote results', playersToKill);
    return playersToKill;
  }
}

module.exports = Votes;
