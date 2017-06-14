'use strict';

const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient({host: "redis"})

module.exports.getRedisClient = () => {
    return client
};
