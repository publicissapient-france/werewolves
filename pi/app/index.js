const express = require('express');
const logger = require('./logger');

const TalkService = require('./talk/service-talk');

const app = express();

app.get('/', (req, res) => {
  res.send('werewolves pi works!');
});

app.get('/talk', (req, res) => {
  const talkService = new TalkService();
  talkService.talk();
  res.send('trying to talk to Cast device');
});

app.listen(3000, () => {
  logger.info(`App running in ${process.env.NODE_ENV} mode on port 3000 > http://localhost:3000/`);
});
