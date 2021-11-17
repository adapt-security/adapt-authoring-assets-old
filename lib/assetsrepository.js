import AssetsUtils from './assetsUtils';
import fs from 'fs/promises';
import fse from 'fs-extra';
import { ObjectID } from 'mongodb';
import path from 'path';

export default class AssetsRepository {
  constructor(repositoryPath, thumbnailSuffix) {
    this.repositoryPath = repositoryPath;
    this.thumbnailSuffix = thumbnailSuffix;
    this.init();
  }
  async init() {
    try {
      await fs.mkdir(this.repositoryPath, { recursive: true });
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
  }
  async hasAsset(filename) {
    const pathExists = await fse.pathExists(path.join(this.repositoryPath, filename))
    return pathExists;
  }
  fullPath(filename) {
    return path.join(this.repositoryPath, filename);
  }
  /**
   *  Save asset to repository
   * @param {File} file
   */
  async save(file) {
    try {
      var objectId = new ObjectID();
      const ext = AssetsUtils.extensionByMimetype(file.type);
      const filepath = `${objectId}.${ext}`;
      const dest = path.join(this.repositoryPath, filepath);
      AssetsUtils.ensureAssetDir(dest);
      await fs.copyFile(file.path, dest);
      return filepath;
    } catch (err) {
      //TODO: error handling & refactoring
      throw err;
    }
  }
  /**
* rename file name with mongodb id
* @param filepath path of old file
* @param mimeType mimeType of old file
* @param id  asset id
* @returns {string}
*/
  async rename(filepath, mimeType, id) {
    const ext = AssetsUtils.extensionByMimetype(mimeType);
    const newFilePath = `${id}.${ext}`;
    const dest = path.join(this.repositoryPath, filepath);
    const target = path.join(this.repositoryPath, newFilePath);

    try {
      fs.rename(dest, target);
      return newFilePath;
    } catch (err) {
      //TODO: error handling & refactoring
      throw err;
    }
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