import AssetsUtils from './assetsUtils.js';
import FileProcessor from './fileprocessor.js';
import path from 'path';

export default async function insertasset(file, fields) {
  let fileProcessor = new FileProcessor();
  const filename = await this.repository.save(file.filepath, file.mimetype);
  let metadata = {};
  const [type] = file.mimetype.split('/');
  switch (type) {
    case 'audio':
      metadata = await fileProcessor.retrieveMediaMetadata(file.filepath);
      break;
    case 'image':
      fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
      await fileProcessor.createImageThumb(this.repository.fullPath(filename));
      break;
    case 'video':
      const videoInRepositoryPath = path.join(this.repository.repositoryPath, filename);
      fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeight);
      const videoPoster = await fileProcessor.createVideoPoster(videoInRepositoryPath);
      await fileProcessor.createVideoThumbnail(videoInRepositoryPath);
      const poster = { 'poster': videoPoster };
      metadata = await fileProcessor.retrieveMediaMetadata(file.filepath);
      metadata = Object.assign(poster, metadata);
      break;
  }
  const result = await this.insert(Object.assign(fields, {
    "path": filename,
    "type": type,
    "size": AssetsUtils.getFileSize(file.filepath),
  }), metadata);

  return result;
};