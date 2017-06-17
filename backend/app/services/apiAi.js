'use strict';

const gameSetup = require("../game/setup")

module.exports.apiAiActionMap = new Map();

const addSpeechToMessage = (message, speech) => {
    return message + speech
}

const addAudioToMessage = (message, audioUrl, audioSpeech) => {
    return message + '<audio src="' + audioUrl + '">' + audioSpeech + '</audio>'
}

const startMessage = () => {
    return '<speak>';
}

const endMessage = (message) => {
    return message + '</speak>';
}

const createGame = (assistant) => {
    console.log("Creating game")
    const uuid = gameSetup.createGame()
    console.log(assistant.body_.result.fulfillment.messages)

    var message = startMessage()
    var messages = assistant.body_.result.fulfillment.messages
    messages.forEach((messageFromAi) => {
        if (messageFromAi.textToSpeech) {
            console.log("Handling ", messageFromAi.textToSpeech)
            var addition = messageFromAi.textToSpeech.replace("$gameId", "<say-as interpret-as=\"characters\">" + uuid + "</say-as>")
            message = addSpeechToMessage(message, addition)
        }
    })
    message = endMessage(message)
    console.log(message)
    assistant.tell(message)
}

this.apiAiActionMap.set('CREATE_GAME', createGame);

const startGame = (assistant) => {
    console.log("Starting game")
    const uuid = gameSetup.createGame()
    console.log(assistant)
    assistant.tell("Your game id is " + uuid)
}

this.apiAiActionMap.set('START_GAME', startGame);

const startGameIsConfirmed = (assistant) => {
    console.log("Starting game")
    const uuid = gameSetup.createGame()
    console.log(assistant)
    assistant.tell("Your game id is " + uuid)
}

this.apiAiActionMap.set('START_GAME', startGameIsConfirmed);


