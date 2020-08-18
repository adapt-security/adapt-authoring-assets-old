const path = require('path');
const sharp = require('sharp');
const platform = require('os').platform();
const ptMaps = { 'win32': 'win.exe', 'darwin': 'mac', 'linux': 'linux' };
const ffProbeBin = `${require.resolve('util-ffprobe').replace(/index\.js$/, '')}util-ffprobe-${ptMaps[platform]}`;
const ffMpegBin = `${require.resolve('util-ffmpeg').replace(/index\.js$/, '')}util-ffmpeg-${ptMaps[platform]}`;
const fluentFfmpeg = require('fluent-ffmpeg');
fluentFfmpeg.setFfmpegPath(ffMpegBin);
fluentFfmpeg.setFfprobePath(ffProbeBin);
const VideoThumbnailGenerator = require('video-thumbnail-generator').default;
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
  //todo: we could replace sharp by ffmpeg to resize images. but since sharp is shipped with node, so there is no need eventually
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
    let result = '';
    try {
      const metadata = await this.retrieveMediaMetadata(videoFile);
      const thumbSize = AssetsUtils.getMaxThumbSize(
        metadata.streams[0].width,
        metadata.streams[0].height,
        this.thumbnail_max_width,
        this.thumbnail_max_height);
      await this.createVideoScreenshot(videoFile, thumbSize, this.thumbSuffix).then((thumbFile) => {
        result = thumbFile;
      });
    } catch (error) {
      throw new Error(error);
    }
    return result;
  }
  /**
  * Creates a video screenshot file in full video size (poster image) and return path to it.
  * @param videoFile {string} full path to video
  * @returns {Promise<string>}
  */
  async createVideoPoster(videoFile) {
    let result = '';
    try {
      const metadata = await this.retrieveMediaMetadata(videoFile);
      const size = {
        width: metadata.streams[0].width,
        height: metadata.streams[0].height,
      };
      await this.createVideoScreenshot(videoFile, size, "_poster").then((file) => {
        result = file;
      });
    } catch (error) {
      throw new Error(error);
    }
    return result;
  }
  /**
  * Creates screenshot of videoFile after 5% of duration.
  * Delay is usefull in case of videos starting with a blank screen.
  * @param videoFile {string} full video path
  * @param size {Object} format {width:number,height:number}
  *  @param suffix {string} suffix that is appended to original filename before extension
  *  @returns {Promise<string>}
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
    } catch (error) {
      throw new Error(error);
    }
    return filename;
  }
  /**
  *
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