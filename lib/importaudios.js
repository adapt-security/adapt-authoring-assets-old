const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');

const importAudios = function(req, res, next) {
  const importAudio = async (audio) => {
    const filenameHash = await this.repository.save(audio.path, audio.type);
    const jsonschema = await this.app.waitForModule('jsonschema');
    let defaults = {};
    jsonschema
      .applyDefaults(this.schemaName, {
        "path": filenameHash,
        "type": "audio",
        "size": AssetsUtils.getFileSize(audio.path)
      })
      .then((m) => defaults = m)
      .catch((e) => next(e));

    const fileProcessor = new FileProcessor();
    const metadata = await fileProcessor.retrieveMediaMetadata(audio.path);

    const result = await this.insert(Object.assign(defaults, req.fields, { metadata: metadata }), {});
    return result;
  };

  if(req.audios && req.audios.length) {
    Promise.all(req.audios.map(importAudio)).then((results) => {
      if(results) req.results = [].concat(req.results, results);
      return next();
    }).catch((e) => {
      res.status(500).send(e);
    });
  } else {
    return next();
  }
};

module.exports = importAudios;