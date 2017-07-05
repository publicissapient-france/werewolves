const express = require('express');
const w = require('winston');

const app = express();

app.get('/', (req, res) => {
  res.send('werewolves pi works!');
});

app.listen(3000, () => {
  w.log('info', `App running in ${process.env.NODE_ENV} mode on port 3000 > http://localhost:3000/`);
});
