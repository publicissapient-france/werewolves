'use strict';

const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);

const client =  redis.createClient({host:"redis"})


module.exports.checkEndConditions = (gameId) => {
    this.checkWolvesVictory(gameId)
    this.checkVillagersVictory(gameId)
};

module.exports.checkWolvesVictory = (gameId) => {
    console.log("checkWolvesVictory")

    // key : gameId-villagers
    const villagersSetKey = gameId + "-villagers"
    // key : gameId-alive
    const aliveSetKey = gameId + "-alive"

    client.sinterAsync(villagersSetKey, aliveSetKey).then((res) => {
        console.log(res)
        if(res.length == 1) {
            console.log("Wolves win !")
        } else {
            console.log("No wolves victory yet")
        }
    });
};

module.exports.checkVillagersVictory = (gameId) => {
    // key : gameId-wolves
    const wolvesSetKey = gameId + "-wolves"
    // key : gameId-alive
    const aliveSetKey = gameId + "-alive"

    client.sinterAsync(wolvesSetKey, aliveSetKey).then((res) => {
        if(res.length == 0) {
            console.log("Villagers win !")
        } else {
            console.log("No villagers victory yet")
        }
    });
};
