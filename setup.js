'use strict';

const gameUtils = require("./gameUtils")

const redis = require("./redis")
const client = redis.getRedisClient()

module.exports.createGame = () => {
    // TODO Assign a game id
};

module.exports.addPlayer = (gameId, userId) => {
    // Check if user already exists
    return client.sismemberAsync(gameUtils.getAliveKey(gameId), userId).then((res) => {
        if (res.length > 0) {
            // TODO return error to user
            // FIREBASE event to be pushed
            console.log("Player already in game")
        } else {
            client.saddAsync(gameUtils.getAliveKey(gameId), userId).then(() => {
                console.log("Player added")
            })
        }
    })
};
// TODO
// 8 players : 2 Wolves, 1 Clairvoyant, 1 Captain, 4 Villagers
// 9 players : 2 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 4 Villagers
// 10 players : 2 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 1 Little Girl, 4 Villagers
// 11 players : 2 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 1 Sorcerer,  5 Villagers
// 12 players : 3 Wolves, 1 Clairvoyant, 1 Cupid, 1 Hunter, 1 Little Girl, 1 Thief, 4 Villagers
const distribution = {
    6: ["wolves", "wolves", "clairvoyant", "captain", "villagers", "villagers"],
    7: ["wolves", "wolves", "clairvoyant", "captain", "villagers", "villagers", "villagers"],
    8: ["wolves", "wolves", "clairvoyant", "captain", "villagers", "villagers", "villagers", "villagers"]
}


Array.prototype.randsplice = function () {
    var ri = Math.floor(Math.random() * this.length);
    var rs = this.splice(ri, 1);
    return rs;
}

module.exports.distributeRoles = (gameId) => {
    return client.scardAsync(gameUtils.getAliveKey(gameId)).then((cardinality) => {
        return client.smembersAsync(gameUtils.getAliveKey(gameId)).then((players) => {
            var roles = distribution[cardinality]
            players.forEach((player) => {
                var role = roles.randsplice()
                console.log(player, role)

                client.sadd(gameUtils.getAnyRoleKey(gameId, role), player)
                if (role != "wolves") {
                    client.sadd(gameUtils.getVillagersKey(gameId), player)
                }
            })

        })
    })
};




