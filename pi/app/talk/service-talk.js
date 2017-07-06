const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const mdns = require('mdns');
const logger = require('../logger');

class TalkService {
  talk() {
    this.browser = mdns.createBrowser(mdns.tcp('googlecast'));
    this.browser.on('serviceUp', (service) => {
      logger.info(`found device ${service.name} at ${service.addresses[0]}:${service.port}`);
      TalkService.onServiceUp(service);
    });
    this.browser.on('serviceDown', (service) => {
      logger.info(`service down ${service}`);
    });
    this.browser.start();
  }

  static onServiceUp(service) {
    const client = new Client();

    client.connect(service.addresses[0], () => {
      logger.info(`connected to ${service.name}, launching app`);

      client.launch(DefaultMediaReceiver, (err, player) => {
        if (err) {
          logger.error(`an error occurred ${err.message}`);
          client.close();
          return;
        }

        const media = {
          contentId: 'http://www.memoclic.com/medias/sons-wav/2/729.wav',
          contentType: 'audio/wav',
          streamType: 'BUFFERED',
          metadata: {
            type: 0,
            metadataType: 0,
            title: 'Big Buck Bunny',
            images: [
              {
                url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
              },
            ],
          },
        };

        player.on('status', status => logger.info(`status broadcast player state ${status.playerState}`));

        logger.info(`app ${player.session.displayName} launched, loading media ${media.contentId}...`);

        player.load(media, {
          autoplay: true,
        }, (err2, status) => {
          if (err2) {
            logger.error(`an error occurred ${err.message}`);
            client.close();
            return;
          }
          logger.info(`media loaded player state ${status.playerState}`);
        });
      });

      client.on('error', (err) => {
        logger.error(`an error occurred ${err.message}`);
        client.close();
      });
    });
  }
}

module.exports = TalkService;
