const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const mdns = require('mdns');
const Promise = require('bluebird');
const EventEmitter = require('events');

const logger = require('../logger');

class TalkService {
  constructor() {
    this.player = null;
    this.client = null;
    this.browser = null;
    this.status = null;
    this.emitter = new EventEmitter();
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
            logger.info('sending end event');
            this.emitter.emit('end');
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
    this.player.load(media, {
      autoplay: true,
    }, (err2, status) => {
      if (err2) {
        logger.error(`an error occurred ${err2.message}`);
        this.client.close();
        return;
      }
      logger.info(`media loaded player state ${status.playerState}`);
    });
  }

  disconnect() {
    logger.info('disconnecting');
    this.client.close();
  }
}

module.exports = TalkService;
