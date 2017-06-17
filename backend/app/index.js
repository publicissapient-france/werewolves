'use strict';

const express = require('express');
const bodyParser = require('body-parser')

const ApiAiApp = require('actions-on-google').ApiAiApp;

const apiAiSetup = require("./services/apiAi")

const app = express();
app.use(bodyParser.json())

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// For demo only
function playAudio(assistant) {
    console.log("Play sound")
    let text_to_speech = '<speak>'
        + 'I can play a sound'
        + '<audio src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg">a digital watch alarm</audio>'
        + 'I can pause <break time="3" />. '
        + '<audio src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg">a digital watch alarm</audio>'
        + '</speak>'
    assistant.tell(text_to_speech);
};

function simpleResponse (home) {
    home.ask({speech: 'Howdy! I can tell you fun facts about ' +
    'almost any number, like 42. What do you have in mind?',
        displayText: 'Howdy! I can tell you fun facts about almost any ' +
        'number. What do you have in mind?'})
}

app.get('/', (req, res) => {
    res.status(200).send('Basic page for the Werewolves game').end();
});

// Endpoint for home interactions
app.post('/home', (req, res) => {
    console.log("Home request received")
    const assistant = new ApiAiApp({request: req, response: res})

    console.log("Handling request")
    assistant.handleRequest(apiAiSetup.apiAiActionMap);

    //playAudio(assistant)
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App Werewolves listening on port ${PORT}`);
});