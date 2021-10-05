const fs = require('fs/promises');
const fse = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
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
    const pathExists = await fse.pathExists(path.join(this.repositoryPath, AssetsUtils.nameToPath(filename)))
    return pathExists;
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
    const uuid = uuidv4();
    const ext = AssetsUtils.extensionByMimetype(mimeType);
    const filename = `${uuid}.${ext}`;
    const filepath = AssetsUtils.nameToPath(`${filename}`);
    const dest = path.join(this.repositoryPath, filepath) ;
    AssetsUtils.ensureAssetDir(dest);
    await fs.copyFile(file, dest);
    return filename;
  }
  //Delete asset file
  delete(filePath) {
    try {
      fs.unlink(filePath);
      return true;
    } catch (err) {
      //TODO: error handling & refactoring
      return false;
    }
  }
  //Delete assets auto-generated thumbnail
  deleteThumbnail(filePath) {
    try {
      fs.unlink(AssetsUtils.getThumbPath(filePath, this.thumbnailSuffix));
      return true;
    } catch (err) {
      //TODO: error handling & refactoring
      return false;
    }
  }
  //Delete assets auto-generated video poster
  deleteVideoPoster(filePath) {
    try {
      fs.unlink(AssetsUtils.getVideoPosterPath(filePath));
      return true;
    } catch (err) {
      //TODO: error handling & refactoring
      return false;
    }
  }
}

module.exports = AssetsRepository;
