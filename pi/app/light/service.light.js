const hue = require('node-hue-api');
const {
  HueApi,
} = require('node-hue-api');
const _ = require('lodash');

const logger = require('../logger');

class LightService {
  constructor() {
    this.ip = null;
    this.api = null;
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

  initApi() {
    this.api = new HueApi(this.ip, this.username);
  }

  findLights() {
    if (this.api) {
      return this.api.lights()
        .then(results => this.onLightsFound(results));
    }
    return null;
  }

  onLightsFound(results) {
    this.lights = results.lights;
    _.each(results.lights, light => logger.info(`light{id: ${light.id}, state.on:${light.state.on}, name: ${light.name}}`));
  }

  turnLightOn(id) {
    if (this.lights) {
      const light = _.find(this.lights, l => Number(l.id) === id);
      if (light) {
        const state = hue.lightState.create();
        if (this.api) {
          return this.api.setLightState(id, state.on());
        }
      }
    }
    return null;
  }

  turnLightOff(id) {
    if (this.lights) {
      const light = _.find(this.lights, l => Number(l.id) === id);
      if (light) {
        const state = hue.lightState.create();
        if (this.api) {
          return this.api.setLightState(id, state.off());
        }
      }
    }
    return null;
  }

}

module.exports = LightService;
