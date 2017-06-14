'use strict';

const redis = require('redis');
const bluebird = require('bluebird');
const conditions = require('./conditions');

bluebird.promisifyAll(redis.RedisClient.prototype);

const client =  redis.createClient({host:"redis"})

module.exports.killPlayer = (gameId, userId) => {
    // key : gameId-alive
    const aliveSetKey = gameId + "-alive"

    client.sremAsync(aliveSetKey, userId).then((res) => {
        console.log(userId, " is dead")
        conditions.checkEndConditions(gameId)
    });
};

module.exports.hunterIsKilled = (gameId) => {
    // TODO Hunter kills someone straight away
};

module.exports.loverIsKilled = (gameId) => {
    // TODO The other lover is killed straight away
};