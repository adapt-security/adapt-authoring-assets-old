const FileProcessor = require('./fileprocessor');
const importAudios = function  (req, res, next) {
  const importAudio = async (audio) => {
    let filenameHash = await this.repository.save(audio.path, audio.type);
    const defaults = {
      "_isDeleted": false,
      "metadata": {},
      "title": '',
      "description": '',
      "path": filenameHash,
      "type": 'audio',
      "tags": [],
      "createdAt": (new Date()).toString(),
      "createdBy": {},
      "size": 0
    };
    let fileProcessor = new FileProcessor();
    let metadata = await fileProcessor.retrieveMediaMetadata(audio.path)
    const result = await this.insert(Object.assign(defaults, req.fields, {metadata:metadata}), {});
    return result;
  }
  if (req.audios && req.audios.length) {
    Promise.all(req.audios.map(importAudio)).then( () => {
      next()
    }).catch((e) => {
      res.status(500).send(e.message);
    });
  } else {
    next();
  }
};

module.exports = importAudios;
