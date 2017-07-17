const hue = require('node-hue-api');
const {
  HueApi,
} = require('node-hue-api');

const logger = require('../logger');

class LightService {
  constructor() {
    this.ip = null;
    this.username = process.env.USERNAME;
  }

  searchBridge() {
    return hue.nupnpSearch()
      .then(bridge => this.onBridgeFound(bridge));
  }

  onBridgeFound(bridge) {
    this.ip = bridge[0].ipaddress;
    logger.info(`bridge found ${this.ip}`);
    return this.ip;
  }

  register() {
    return new HueApi().registerUser(this.ip, 'werewolves node.js api')
      .then(result => this.onUserRegistered(result));
  }

  onUserRegistered(result) {
    this.username = result;
    logger.info(`registered user ${JSON.stringify(result)}`);
    return this.username;
  }
}

module.exports = LightService;
