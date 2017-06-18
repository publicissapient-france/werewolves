'use strict';

const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);

// TODO
//const client = redis.createClient({host: process.env.REDIS_HOST || "redis"})
const client = null

module.exports.getRedisClient = () => {
    return client
};
