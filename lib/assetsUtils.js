import { App } from 'adapt-authoring-core';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

export default class AssetsUtils {
  /**
 * checks if filepath directory exists and creates it if it doesn't exist
 * @param filepath
 * @returns {string}
 */
  static ensureAssetDir(filepath) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
  }
  /**
   * converts path to filename
   * @param filepath
   * @returns {string}
   */
  static pathToName(filepath) {
    return filepath.substring(filepath.lastIndexOf("/") + 1);
  }
  /**
   * returns the name of the thumbnail file for a given filename and suffix
   * returns a png if original file was *.mp4
   * @param assetPath
   * @param thumbSuffix default: _thumb
   * @returns {void | string | *}
   */
  static getThumbPath(assetPath, thumbSuffix = "_thumb") {
    let fileExtension = assetPath.match(/\.(\S{3,4})$/)[0];
    if (fileExtension === ".mp4") {
      return assetPath.replace(fileExtension, `${thumbSuffix}.png`);
    } else {
      return assetPath.replace(fileExtension, `${thumbSuffix}${fileExtension}`);
    }
  }
  /**
   * returns the name of the poster file for a given filename and suffix
   * @param assetPath
   * @param posterSuffix default: _thumb
   * @returns {void | string | *}
   */
  static getVideoPosterPath(assetPath, posterSuffix = "_poster") {
    let fileExtension = assetPath.match(/\.(\S{3,4})$/)[0];
    return assetPath.replace(fileExtension, `${posterSuffix}.png`);
  }
  /**returns an Object
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
    return AssetsUtils.supportedMimetypes[mimeType] || "unknown";
  }
  static mimetypeByExtension(extension) {
    for (let [key, value] of Object.entries(AssetsUtils.supportedMimetypes)) {
      if (value === extension) {
        return key;
      }
    }
    return new Error(App.instance.lang.t("error.unknowntype"));
  }
  /**
   * Get hash from a file, returns promise
   * @param file
   * @returns {Promise<unknown>}
   */
  static getHash(file) {
    return new Promise((resolve, reject) => {
      let fd = fs.createReadStream(file);
      let hash = crypto.createHash("sha1");
      hash.setEncoding("hex");
      fd.on("end", () => {
        hash.end();
        resolve(hash.read().toString());
      });
      fd.pipe(hash);
    });
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
   * Deletes Dir
   * returns Promise
   * @param {directory path} dirPath
   */
  static removeDir(dirPath) {
    return fs.remove(dirPath);
  }
  static getMimeType(filename) {
    const extname = path.extname(filename).slice(1);
    switch(extname) {
      case "gif": return "image/gif";
      case "jpg": case "jpeg": return "image/jpeg";
      case "mp3": return "audio/mpeg";
      case "mp4": return "video/mp4";
      case "oga": return "audio/ogg";
      case "ogv": return "video/ogg";
      case "pdf": return "application/pdf";
      case "png": return "image/png";
      case "vtt": return "text/vtt";
      case "webm": return "video/webm";
      case "webp": return "image/webp";
      case "zip": return "application/zip";
    }
  }
  //supported mimeType
  static _supportedMimetypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "audio/mpeg": "mp3",
    "video/mp4": "mp4",
    "application/zip": "zip",
  };
  static get supportedMimetypes() {
    return AssetsUtils._supportedMimetypes;
  }
  static set supportedMimetypes(value) {
    AssetsUtils._supportedMimetypes = value;
  }
}