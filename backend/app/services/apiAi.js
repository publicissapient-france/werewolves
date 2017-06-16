'use strict';

const gameSetup = require("../game/setup")

module.exports.apiAiActionMap = new Map();

const startGame = (assistant) => {
    console.log("Starting game")
    const uuid = gameSetup.createGame()
    assistant.tell("Your game id is " + uuid)
}

this.apiAiActionMap.set('START_GAME', startGame);

