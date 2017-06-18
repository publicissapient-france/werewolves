const conditions = require('./conditions');
const redis = require('./services/redis');

const client = redis.getRedisClient();

module.exports.killPlayer = (gameId, userId) => {
  // key : gameId-alive
  const aliveSetKey = `${gameId}-alive`;

  client.sremAsync(aliveSetKey, userId).then((res) => {
    console.log(userId, ' is dead');
    conditions.checkEndConditions(gameId);
  });
};
