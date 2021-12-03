import AssetsUtils from './assetsUtils.js';
import FileProcessor from './fileprocessor.js';
import path from 'path';

export default function importVideos(req, res, next) {
  const importVideo = async (video) => {
    const filename = await this.repository.save(video);
    const jsonschema = await this.app.waitForModule('jsonschema');

    let defaults = {};
    jsonschema
      .applyDefaults(this.schemaName, {
        "path": filename,
        "type": "video",
        "size": AssetsUtils.getFileSize(video.path),
      })
      .then((m) => defaults = m)
      .catch((e) => next(e));

    try {
      const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
      //get metadata of video
      const metadata = await fileProcessor.retrieveMediaMetadata(video.path);
      //insert video
      const result = await this.insert(Object.assign(defaults, req.fields, { metadata: metadata }), {});
      //rename saved video
      const newFilePath = await this.repository.rename(filename, video.mimetype, result._id);
      //create video poster image
      const videoPoster = await fileProcessor.createVideoPoster(path.join(this.repository.repositoryPath, newFilePath));
      //create video thumbnail
      await fileProcessor.createVideoThumbnail(path.join(this.repository.repositoryPath, newFilePath));
      //update db info
      return await this.update({ _id: result._id }, { 'path': newFilePath, "poster": videoPoster });
    } catch (e) {
      //clears up the asset file at failure of database insert 
      const filepath = filename;
      const hasMultiPointer = await this.hasMultiPointer(filename)
      if (!hasMultiPointer) {
        await this.deleteFile(path.join(this.repositoryPath, filepath), 'video');
      }
      return next(e);
    }

  };
  if(req.videos && req.videos.length) {
    Promise.all(req.videos.map(importVideo)).then((results) => {
      if(results) req.results = [].concat(req.results, results);
      return next();
    }).catch((e) => {
      res.status(500).send(e);
    });
  } else {
    return next();
  }
};