'use strict';

module.exports.getAliveKey = (gameId) => {
    return gameId + "-alive"
}

module.exports.getVillagersKey = (gameId) => {
    return gameId + "-villagers"
}

module.exports.getAnyRoleKey = (gameId, role) => {
    return gameId + "-" + role
}