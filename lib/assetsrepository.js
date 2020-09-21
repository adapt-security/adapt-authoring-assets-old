const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const AssetsUtils = require('./assetsUtils');
class AssetsRepository {
  constructor(repositoryPath, thumbnailSuffix) {
    this.repositoryPath = repositoryPath;
    this.thumbnailSuffix = thumbnailSuffix;
    this.init();
  }
  init() {
    // todo: throw error if not accessible
    fs.ensureDirSync(this.repositoryPath);
  }
  async hasAsset(filename) {
    const exists = await fs.pathExists(
      path.join(this.repositoryPath, AssetsUtils.nameToPath(filename))
    );
    return exists;
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
    let filename = "";
    await this.getHash(file).then((hash) => {
      filename = `${hash}.${AssetsUtils.extensionByMimetype(mimeType)}`;
      return fs.copy(
        file,
        path.join(this.repositoryPath, AssetsUtils.nameToPath(filename))
      );
    });
    return filename;
  }

  //Delete asset file
  delete(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      });
    });
  }
  //Delete asset thumb
  deleteThumbnail(filePath) {
    return new Promise((resolve, reject) => {
      let thumbPath = AssetsUtils.getThumbPath(filePath, this.thumbnailSuffix);
      console.log(thumbPath);
      fs.unlink(thumbPath, (error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      });
    });
  }
  //Delete asset poster
  deleteVideoPoster(filePath) {
    let posterPath = AssetsUtils.getVideoPosterPath(filePath);
    console.log(posterPath);
    return new Promise((resolve, reject) => {
      fs.unlink(posterPath, (error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      });
    });
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
