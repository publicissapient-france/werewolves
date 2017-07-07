const textToMp3 = require('text-to-mp3');
const fs = require('fs');
const path = require('path');

const logger = require('../logger');

class TTSService {
  static createFilenameFromText(text, extension) {
    // eslint-disable-next-line
    const cleanText = text.replace(/\s/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/__+/g, '_');

    return `${cleanText}.${extension}`;
  }

  static read(text) {
    const filename = TTSService.createFilenameFromText(text, 'mp3');

    const relativeFilePath = `./public/${filename}`;

    if (fs.existsSync(relativeFilePath)) {
      const filePath = path.resolve(relativeFilePath);
      logger.info(`speech retrieved from disk ${filePath}`);
      return Promise.resolve(filePath);
    }

    return textToMp3.saveMP3(text, relativeFilePath)
      .then(filePath => logger.info(`speech retrieved from network ${filePath}`))
      .catch(err => logger.error(`cannot read text ${err.message}`));
  }
}
module.exports = TTSService;
