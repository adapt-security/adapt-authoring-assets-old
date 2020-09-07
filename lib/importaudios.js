const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');

const importAudios = function(req, res, next) {
  const importAudio = async(audio) => {
    const filenameHash = await this.repository.save(audio.path, audio.type);
    const jsonschema = await this.app.waitForModule('jsonschema');

    let defaults = {};
    jsonschema.applyDefaults('assets', {
      "path": filenameHash,
      "type": 'audio',
      "size": AssetsUtils.getFileSize(audio.path)
    })
      .then(m => defaults = m)
      .catch(e => res.sendError(e));

        console.log('I am audio')
    const fileProcessor = new FileProcessor();
    const metadata = await fileProcessor.retrieveMediaMetadata(audio.path);

    const result = await this.insert(Object.assign(defaults, req.fields, { metadata: metadata }), {});
    return result;
  };
  if (req.audios && req.audios.length) {
    Promise.all(req.audios.map(importAudio)).then(() => {
      next();
    }).catch((e) => {
      res.status(500).sendError(e);
    });
  } else {
    next();
  }
};

module.exports = importAudios;
