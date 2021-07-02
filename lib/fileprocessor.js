const path = require('path');
const sharp = require('sharp');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const fluentFfmpeg = require('fluent-ffmpeg');
fluentFfmpeg.setFfmpegPath(ffmpegStatic);
fluentFfmpeg.setFfprobePath(ffprobeStatic.path);
const AssetsUtils = require('./assetsUtils');

class FileProcessor {
  /**
   * @param thumbSuffix
   * @param thumbnailMaxWidth
   * @param thumbnail_max_height
   */
  constructor(thumbSuffix = '_thumb', thumbnailMaxWidth = 200, thumbnailMaxHeight = 100) {
    this.thumbSuffix = thumbSuffix;
    this.thumbnail_max_width = thumbnailMaxWidth;
    this.thumbnail_max_height = thumbnailMaxHeight;
  }
  /**
   *
   * @param imagePath
   * @returns {Promise<void>}
   */
  async createImageThumb(imagePath) {
    const thumbPath = AssetsUtils.getThumbPath(imagePath, this.thumbSuffix);
    await sharp(imagePath)
      .resize(this.thumbnail_max_width, this.thumbnail_max_height, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(thumbPath);
    return thumbPath;
  }
  /**
   * Create a video screenshot file in thumbnail size and return path to it.
   * @param videoFile {string} full path to video
   * @returns {Promise<string>}
   */
  async createVideoThumbnail(videoFile) {
    const { width, height } = (await this.retrieveMediaMetadata(videoFile)).streams[0];
    const thumbSize = AssetsUtils.getMaxThumbSize(width, height, this.thumbnail_max_width, this.thumbnail_max_height);
    return await this.createVideoScreenshot(videoFile, thumbSize, this.thumbSuffix);
  }
  /**
   * Creates a video screenshot file in full video size (poster image) and return path to it.
   * @param videoFile {string} full path to video
   * @returns {Promise<string>}
   */
  async createVideoPoster(videoFile) {
    const { width, height } = (await this.retrieveMediaMetadata(videoFile)).streams[0];
    return await this.createVideoScreenshot(videoFile, { width, height }, "_poster");
  }
  /**
   * Creates screenshot of videoFile after 5% of duration.
   * Delay is usefull in case of videos starting with a blank screen.
   * @param {string} videoFile full video path
   * @param {Object} size
   * @param {number} size.width output width in pixels
   * @param {number} size.height output height in pixels
   * @param {string} suffix suffix that is appended to original filename before extension
   * @returns {Promise<string>}
   */
  async createVideoScreenshot(videoFile, size, suffix) {
    const filename = `${path.basename(videoFile, '.mp4')}${suffix}.png`;
    try {
      const generator = new VideoThumbnailGenerator({
        size: `${size.width}x${size.height}`,
        sourcePath: videoFile,
        thumbnailPath: `${path.dirname(videoFile)}/`
      });
      await generator.generateOneByPercent(5, { filename: filename });
    } catch(error) {
      throw new Error(error);
    }
    return filename;
  }
  /**
   * Retrieve media metadata
   * @param mediaPath {string} full path to media ( audio | video )
   * @returns {Promise<void>}
   */
  retrieveMediaMetadata(mediaPath) {
    return new Promise((resolve, reject) => {
      fluentFfmpeg.ffprobe(mediaPath, function(error, result) {
        error ? reject(error) : resolve(result);
      });
    });
  }
}

module.exports = FileProcessor;