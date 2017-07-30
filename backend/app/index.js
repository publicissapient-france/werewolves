const express = require('express');
const bodyParser = require('body-parser');
const ApiAiApp = require('actions-on-google').ApiAiApp;
const apiAiSetup = require('./services/apiAi');

const app = express();
app.use(bodyParser.json());
app.use('/static', express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.status(200).send('Basic page for the Werewolves game').end();
});

// GCloud Health Check
app.get('/_ah/health', (req, res) => {
  res.status(200);
  res.send();
});

// Endpoint for home interactions
app.post('/home', (req, res) => {
  console.log('Home request received');
  const assistant = new ApiAiApp({ request: req, response: res });

  console.log('Handling request');
  assistant.handleRequest(apiAiSetup);
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App Werewolves by Xebia listening on port ${PORT}`);
});

module.exports = app;
