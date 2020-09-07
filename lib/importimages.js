const FileProcessor = require('./fileprocessor');
const AssetsUtils = require('./assetsUtils');

const importImages = function(req, res, next) {
  const importImage = async(image) => {
    const filenameHash = await this.repository.save(image.path, image.type);
    const jsonschema = await this.app.waitForModule('jsonschema');

    let defaults = {};
    jsonschema.applyDefaults('assets', {
      "path": filenameHash,
      "type": 'image',
      "size": image.size
    })
      .then(m => defaults = m)
      .catch(e => res.sendError(e));

    const fileProcessor = new FileProcessor(this.thumbnailSuffix, this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
    await fileProcessor.createImageThumb(this.repository.fullPath(filenameHash));

    const result = await this.insert(Object.assign(defaults, req.fields), {});
    return result;
  };
  if (req.images && req.images.length) {
    // todo errors,  success (ids..)
    Promise.all(req.images.map(importImage)).then(() => {
      next();
    }).catch((e) => {
      res.status(500).sendError(e);
    });
  } else {
    next();
  }
};
module.exports = importImages;
