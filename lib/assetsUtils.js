const crypto = require('crypto');
const fs = require('fs-extra');

class AssetsUtils {
  /**
  * converts filename to repository path to the file
  * @param filename
  * @returns {string}
  */
  static nameToPath(filename) {
    return `${filename.substr(0, 2)}/${filename.substr(2, 2)}/${filename}`;
  }
  /**
  * converts path to filename
  * @param filepath
  * @returns {string}
  */
  static pathToName(filepath) {
    return filepath.substring(filepath.lastIndexOf('/') + 1);
  }
  /**
 * returns the name of the thumbnail file for a given filename and suffix
 * returns a png if original file was *.mp4
 * @param assetPath
 * @param thumbSuffix default: _thumb
 * @returns {void | string | *}
 */
  static getThumbPath(assetPath, thumbSuffix = '_thumb') {
    let fileExtension = assetPath.match(/\.(\S{3,4})$/)[0];
    if (fileExtension === '.mp4') {
      return assetPath.replace(fileExtension, `${thumbSuffix}.png`);
    }
    return assetPath.replace(fileExtension, `${thumbSuffix}${fileExtension}`);
  }
  /**
  *
  * @param width
  * @param height
  * @param maxThumbWidth
  * @param maxThumbHeight
  * @returns {{width: number, height: number}}
  */
  static getMaxThumbSize(width, height, maxThumbWidth, maxThumbHeight) {
    let width_tn = 0;
    let height_tn = 0;
    let rw = maxThumbWidth / width;
    let rh = maxThumbHeight / height;
    if (maxThumbHeight > height * rw) {
      width_tn = Math.floor(rw * width);
      height_tn = Math.floor(rw * height);
    } else {
      width_tn = Math.floor(rh * width);
      height_tn = Math.floor(rh * height);
    }
    return { width: width_tn, height: height_tn };
  }
  /**
  * returns file extension by mimetype
  * @param mimeType
  * @returns {*|string}
  */
  static extensionByMimetype(mimeType) {
    return AssetsUtils.supportedMimetypes[mimeType] || 'unknown';
  }
  static mimetypeByExtension(extension) {
    for (let [key, value] of Object.entries(AssetsUtils.supportedMimetypes)) {
      if (value === extension) {
        return key;
      }
    }
    return 'unknown';
  }

  /**
   * returns file size
   * @param  file 
   * @returns {number} 
   */
  static getFileSize(file) {
    return fs.statSync(file).size;
  }
  /**
  *
  * @param file
  * @returns {Promise<unknown>}
  */
  static getHash(file) {
    return new Promise(
    (resolve, reject) => {
      let fd = fs.createReadStream(file);
      let hash = crypto.createHash('sha1');
      hash.setEncoding('hex');
      fd.on('end', () => {
        hash.end();
        resolve(hash.read().toString());
      });
      fd.pipe(hash);
    });
  }
  static supportedMimetypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "audio/mpeg": "mp3",
    "video/mp4": "mp4"
  }
}

module.exports = AssetsUtils;