const assert = require('assert');

const Players = require('../../app/core/players');

describe('Players', () => {
  it('should declare werewolves as winners if there is one villager alive and one wolf alive', () => {
    const alivePlayers =
      {
        jsm: { role: 'WEREWOLF' },
        plo: { role: 'VILLAGER' },
      };
    const winners = new Players(alivePlayers).getWinners();
    assert.equal(winners, 'WEREWOLVES_VICTORY');
  });

  it('should declare villagers as winners if there is zero wolf alive', () => {
    const alivePlayers =
      {
        jsm: { role: 'VILLAGER' },
        plo: { role: 'VILLAGER' },
      };
    const winners = new Players(alivePlayers).getWinners();
    assert.equal(winners, 'VILLAGERS_VICTORY');
  });

  it('should declare no one as winners if there is at most two villagers and at most one wolf alive', () => {
    const alivePlayers =
      {
        jsm: { role: 'VILLAGER' },
        bla: { role: 'VILLAGER' },
        plo: { role: 'WEREWOLF' },
      };
    const winners = new Players(alivePlayers).getWinners()
    assert.equal(winners, null);
  });
});
