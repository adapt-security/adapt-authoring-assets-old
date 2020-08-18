const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const AssetsUtils = require('./assetsUtils');
class AssetsRepository {
  constructor(repositoryPath) {
    this.repositoryPath = repositoryPath;
    this.init();
  }
  init() {
    // todo: throw error if not accessible
    fs.ensureDirSync(this.repositoryPath);
  }
  async hasAsset(filename) {
    const exists = await fs.pathExists(path.join(this.repositoryPath, AssetsUtils.nameToPath(filename) ));
    return exists;
  }
  fullPath(filename) {
    return path.join(this.repositoryPath, AssetsUtils.nameToPath(filename) );
  }
  async save(file, mimeType) {
    let filename = '';
    await this.getHash(file).then((hash) => {
      filename = `${hash}.${AssetsUtils.extensionByMimetype(mimeType)}`;
      return fs.copy(file, path.join(this.repositoryPath, AssetsUtils.nameToPath(filename)));
    }
    );
    return filename;
  }
  getHash(file) {
    return new Promise(
      (resolve, reject) => {
        const fd = fs.createReadStream(file);
        const hash = crypto.createHash('sha1');
        hash.setEncoding('hex');
        fd.on('end', () => {
          hash.end();
          resolve(hash.read().toString());
        });
        fd.pipe(hash);
      }
    );
  }
}
module.exports = AssetsRepository;
