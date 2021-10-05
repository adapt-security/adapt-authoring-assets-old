const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');
const path = require('path');

const importAudios = function(req, res, next) {
  const importAudio = async (audio) => {
    const filename = await this.repository.save(audio.path, audio.type);
    const jsonschema = await this.app.waitForModule('jsonschema');
    let defaults = {};
    jsonschema
      .applyDefaults(this.schemaName, {
        "path": filename,
        "type": "audio",
        "size": AssetsUtils.getFileSize(audio.path)
      })
      .then((m) => defaults = m)
      .catch((e) => next(e));

    try {
      const fileProcessor = new FileProcessor();
      const metadata = await fileProcessor.retrieveMediaMetadata(audio.path);
      const result = await this.insert(Object.assign(defaults, req.fields, { metadata: metadata }), {});
      return result;
    } catch (e) {
      //clears up the asset file at failure of database insert 
      const filepath = AssetsUtils.nameToPath(`${filename}`);
      const hasMultiPointer = await this.hasMultiPointer(filename)
      if (!hasMultiPointer) {
        await this.deleteFile(path.join(this.repositoryPath, filepath), 'audio');
      }
      return next(e);
    }
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