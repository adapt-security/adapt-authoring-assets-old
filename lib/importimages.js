const FileProcessor = require('./fileprocessor');
const importImages = function (req, res, next) {
  const importImage = async (image) => {
    let filenameHash = await this.repository.save(image.path, image.type);
    let fileProcessor = new FileProcessor(this.thumbnailSuffix,this.thumbnailMaxWidth, this.thumbnailMaxHeigt);
    await fileProcessor.createImageThumb(this.repository.fullPath(filenameHash));
    const defaults = {
      "_isDeleted": false,
      "metadata": {},
      "title": '',
      "description": '',
      "path": filenameHash,
      "type": 'image',
      "tags": [],
      "createdAt": (new Date()).toString(),
      "createdBy": {},
      "size": 0
    };
    const result = await this.insert(Object.assign(defaults, req.fields), {});
    return result;
  }
  if (req.images && req.images.length) {
    // todo errors,  success (ids..)
    Promise.all(req.images.map(importImage)).then(() => {
      next()
    }).catch((e) => {
      res.status(500).send(e.message);
    });
  } else {
    next();
  }
};
module.exports = importImages;
