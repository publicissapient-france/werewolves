module.exports.getAliveKey = gameId => `${gameId}-alive`;

module.exports.getVillagersKey = gameId => `${gameId}-villagers`;

module.exports.getAnyRoleKey = (gameId, role) => `${gameId}-${role}`;
