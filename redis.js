'use strict';

const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient({host: process.env.REDIS_HOST || "redis"})

module.exports.getRedisClient = () => {
    return client
};
