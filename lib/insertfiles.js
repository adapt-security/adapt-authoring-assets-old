const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');
const path = require('path');

const importasset = async function (file, fields) {
  const filenameHash = await this.repository.save(file.path, file.type);
  let metadata = {};
  switch (file.type) {
    case 'audio':
      let fileProcessor = new FileProcessor();
      metadata = await fileProcessor.retrieveMediaMetadata(file.path);
      break;
    case 'image':
      fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
      await fileProcessor.createImageThumb(this.repository.fullPath(filenameHash));
      break;
    case 'video':
      const videoInRepositoryPath = path.join(this.repository.repositoryPath, AssetsUtils.nameToPath(filenameHash));
      fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
      const videoPoster = await fileProcessor.createVideoPoster(videoInRepositoryPath);
      await fileProcessor.createVideoThumbnail(videoInRepositoryPath);
      const poster = { 'poster': videoPoster };
      metadata = await fileProcessor.retrieveMediaMetadata(file.path);
      metadata = Object.assign(poster, metadata);
      break;
  }

  const result = await this.insert(Object.assign(fields, {
    "path": filenameHash,
    "type": file.type,
    "size": AssetsUtils.getFileSize(file.path),
  }, metadata));

  return result;
};

module.exports = importasset;