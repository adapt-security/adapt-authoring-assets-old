import AssetsUtils from './assetsUtils.js';
import FileProcessor from './fileprocessor.js';
import path from 'path';

export default function importAudios(req, res, next) {
  const importAudio = async (audio) => {
    const filename = await this.repository.save(audio);
    const jsonschema = await this.app.waitForModule('jsonschema');
    let defaults = {};
    jsonschema
      .applyDefaults(this.schemaName, {
        "path": filename,
        "type": "audio",
        "size": AssetsUtils.getFileSize(audio.filepath)
      })
      .then((m) => defaults = m)
      .catch((e) => next(e));

    try {
      const fileProcessor = new FileProcessor();
      const metadata = await fileProcessor.retrieveMediaMetadata(audio.filepath);
      const result = await this.insert(Object.assign(defaults, req.apiData.data, req.fields, { metadata: metadata }), {});
      //rename saved audio
      const newFilePath = await this.repository.rename(filename, audio.mimetype, result._id);
      //update db info
      return await this.update({ _id: result._id }, { path: newFilePath });
    } catch (e) {
      //clears up the asset file at failure of database insert 
      const filepath = filename;
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