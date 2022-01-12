import AssetsUtils from './assetsUtils.js';
import fs from 'fs/promises';
import fse from 'fs-extra';
import { ObjectId } from 'mongodb';
import path from 'path';

class AssetsRepository {
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
    var objectId = new ObjectId();
    const ext = AssetsUtils.extensionByMimetype(file.mimetype);
    const filepath = `${objectId}.${ext}`;
    const dest = path.join(this.repositoryPath, filepath);
    AssetsUtils.ensureAssetDir(dest);
    await fs.copyFile(file.filepath, dest);
    return filepath;
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
    await fs.rename(dest, target);
    return newFilePath;
  }
  //Delete asset file
  async delete(filePath) {
    return fs.unlink(filePath);
  }
  //Delete assets auto-generated thumbnail
  async deleteThumbnail(filePath) {
    return fs.unlink(AssetsUtils.getThumbPath(filePath, this.thumbnailSuffix));
  }
  //Delete assets auto-generated video poster
  async deleteVideoPoster(filePath) {
    return fs.unlink(AssetsUtils.getVideoPosterPath(filePath));
  }
}

export default AssetsRepository;