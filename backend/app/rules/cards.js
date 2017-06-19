// TODO
// 9 players : 2 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 4 Villagers
// 10 players : 2 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 1 Little Girl, 4 Villagers
// 11 players : 2 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 1 Sorcerer,  5 Villagers
// 12 players : 3 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 1 Little Girl, 1 Thief, 4 Villagers
module.exports.distribution = {
  4: ['werewolf', 'werewolf', 'villager', 'villager'],
  5: ['werewolf', 'werewolf', 'villager', 'villager', 'villager'],
  6: ['werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager'],
};
