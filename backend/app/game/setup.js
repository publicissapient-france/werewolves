const gameUtils = require('./../utils/gameUtils');
const cards = require('./../rules/cards');
const redis = require('./../services/redis');
const firebase = require('./../services/firebase');

const client = redis.getRedisClient();

const moment = require('moment');

module.exports.createGame = () => {
  const gameId = Math.floor(Math.random() * (9999 - 1000)) + 1000;
  /* firebase.database().ref('games/' + gameId).set({
   startDate: moment().format()
   });*/
  return gameId;
};

module.exports.addPlayer = (gameId, userId) =>
  // Check if user already exists
  client.sismemberAsync(gameUtils.getAliveKey(gameId), userId).then((res) => {
    if (res.length > 0) {
      // TODO return error to user
      // FIREBASE event to be pushed
      console.log('Player already in game');
    } else {
      client.saddAsync(gameUtils.getAliveKey(gameId), userId).then(() => {
        console.log('Player added');
      });
    }
  });

Array.prototype.randsplice = function randsplice() {
  const ri = Math.floor(Math.random() * this.length);
  const rs = this.splice(ri, 1);
  return rs;
};

module.exports.distributeRoles = gameId =>
  client.scardAsync(gameUtils.getAliveKey(gameId))
    .then(cardinality =>
      client.smembersAsync(gameUtils.getAliveKey(gameId))
        .then((players) => {
          const roles = cards.distribution[cardinality];
          players.forEach((player) => {
            const role = roles.randsplice();
            console.log(player, role);
            client.sadd(gameUtils.getAnyRoleKey(gameId, role), player);
            if (role != 'wolves') {
              client.sadd(gameUtils.getVillagersKey(gameId), player);
            }
          });
        }));
