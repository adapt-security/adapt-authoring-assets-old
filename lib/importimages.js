import AssetsUtils from './assetsUtils.js';
import FileProcessor from './fileprocessor.js';
import path from 'path';

export default async function importImages(req, res, next) {
  const importImage = async function (image, imageMeta) {
    //save file to repository
    const filename = await this.repository.save(image);

    try {
      //insert file to mongodb
      const result = await this.insert(Object.assign(imageMeta, {
        "path" : filename,
        "type": "image",
        "size": AssetsUtils.getFileSize(image.path),
      }))
      //rename saved image
      const newFilePath = await this.repository.rename(filename, image.type, result._id);
      const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
      //create image thumbnail
      await fileProcessor.createImageThumb(this.repository.fullPath(newFilePath));
      //update db info
      return await this.update({ _id: result._id }, { 'path': newFilePath});
    } catch (e) {
      //clears up the asset file at failure of database insert
      const filepath = filename;
      const hasMultiPointer = await this.hasMultiPointer(filename);
      if (!hasMultiPointer) {
        await this.deleteFile(path.join(this.repositoryPath, filepath), 'image');
      }
      return next(e);
    }
  };
  if (!req.images || !req.images.length) {
    return next();
  }
  try {
    const results = await Promise.all(req.images.map(i => importImage.call(this, i, req.fields)));
    if (results) req.results = [].concat(req.results, results);
    next();
  } catch (e) {
    next(e);
  }
};