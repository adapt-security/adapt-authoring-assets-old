const fs = require('fs/promises');
const crypto = require('crypto');
const path = require('path');
const AssetsUtils = require('./assetsUtils');

class AssetsRepository {
  constructor(repositoryPath, thumbnailSuffix) {
    this.repositoryPath = repositoryPath;
    this.thumbnailSuffix = thumbnailSuffix;
    this.init();
  }
  async init() {
    try {
      await fs.mkdir(this.repositoryPath, { recursive: true });
    } catch(e) { 
      if(e.code !== 'EEXIST') throw e;
    }
  }
  async hasAsset(filename) {
    return await fs.pathExists(path.join(this.repositoryPath, AssetsUtils.nameToPath(filename)));
  }
  fullPath(filename) {
    return path.join(this.repositoryPath, AssetsUtils.nameToPath(filename));
  }
  /**
   *  Save asset to repository
   * @param {File} file
   * @param {String} mimeType
   */
  async save(file, mimeType) {
    const ext = AssetsUtils.extensionByMimetype(mimeType);
    const dest = `${this.repositoryPath}/${AssetsUtils.nameToPath(`${this.repositoryPath}.${ext}`)}`;
    await fs.copy(file, dest);
    return dest;
  }
  //Delete asset file
  delete(filePath) {
    return fs.unlink(filePath);
  }
  //Delete assets auto-generated thumbnail
  deleteThumbnail(filePath) {
    return fs.unlink(AssetsUtils.getThumbPath(filePath, this.thumbnailSuffix));
  }
  //Delete assets auto-generated video poster
  deleteVideoPoster(filePath) {
    return fs.unlink(AssetsUtils.getVideoPosterPath(filePath));
  }
  //Get hash from file
  getHash(file) {
    return new Promise((resolve, reject) => {
      const fd = fs.createReadStream(file);
      const hash = crypto.createHash("sha1");
      hash.setEncoding("hex");
      fd.on("end", () => {
        hash.end();
        resolve(hash.read().toString());
      });
      fd.pipe(hash);
    });
  }
}

module.exports = AssetsRepository;
