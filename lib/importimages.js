const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');

const importImages = async function(req, res, next) {
  const importImage = async function (image, imageMeta) {
    const filenameHash = await this.repository.save(image.path, image.type);
    const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);

    await fileProcessor.createImageThumb(this.repository.fullPath(filenameHash));

    return this.insert(Object.assign(imageMeta, {
      "path": filenameHash,
      "type": "image",
      "size": AssetsUtils.getFileSize(image.path),
    }));
  };
  if(!req.images || !req.images.length) {
    return next();
  }
  try {
    const results = await Promise.all(req.images.map(i => importImage.call(this, i, req.fields)));
    if(results) req.results = [].concat(req.results, results);
    next();
  } catch(e) {
    next(e);
  }
};
module.exports = importImages;
