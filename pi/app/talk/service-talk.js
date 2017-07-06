const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const mdns = require('mdns');
const Promise = require('bluebird');

const logger = require('../logger');

class TalkService {
  constructor() {
    this.player = null;
    this.client = null;
    this.browser = null;
    this.status = null;
    this.resolve = null;
    this.reject = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.browser = mdns.createBrowser(mdns.tcp('googlecast'));
      this.browser.on('serviceUp', (service) => {
        logger.info(`found device ${service.name} at ${service.addresses[0]}:${service.port}`);
        this.launchMediaReceiver(service, resolve, reject);
      });
      this.browser.on('serviceDown', (service) => {
        logger.info(`service down ${service}`);
      });
      this.browser.start();
    });
  }

  launchMediaReceiver(service, resolve, reject) {
    this.client = new Client();

    this.client.connect(service.addresses[0], () => {
      logger.info(`connected to ${service.name}, launching app`);

      this.client.launch(DefaultMediaReceiver, (err, player) => {
        if (err) {
          logger.error(`an error occurred ${err.message}`);
          this.client.close();
          reject(err);
          return;
        }

        this.player = player;

        this.player.on('status', (status) => {
          logger.info(`status broadcast player state ${status.playerState}`);
          if (this.status === 'PLAYING' && status.playerState === 'IDLE') {
            this.status = null;
            this.resolve();
            return;
          }
          this.status = status.playerState;
        });

        resolve();
      });

      this.client.on('error', (err) => {
        logger.error(`an error occurred ${err.message}`);
        this.client.close();
        reject(err);
      });
    });
  }

  talk(media) {
    logger.info(`app ${this.player.session.displayName} launched, loading media ${media.contentId}...`);
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.player.load(media, {
        autoplay: true,
      }, (err2, status) => {
        if (err2) {
          logger.error(`an error occurred ${err2.message}`);
          this.client.close();
          this.reject();
          return;
        }
        logger.info(`media loaded player state ${status.playerState}`);
      });
    });
  }

  disconnect() {
    logger.info('disconnecting');
    this.client.close();
  }
}

module.exports = TalkService;
