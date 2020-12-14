const should = require('should');
const fs = require('fs-extra');
const AssetsUtils = require('../lib/assetsUtils');
const data = require('./data/data');
describe('Asset Module Utils', function () {
  describe('#nameToPath', function () {
    data.pathNameTuple.forEach((entry) => {
      const filename = entry.filename;
      const filepath = entry.filepath;
      it(`should return the correct Path for ${filename} -> ${filepath}`, function () {
        AssetsUtils.nameToPath(filename).should.equal(filepath);
      });
    });
  });
  describe('#pathToName', function () {
    data.pathNameTuple.forEach((entry) => {
      const filename = entry.filename;
      const filepath = entry.filepath;
      it(`should return the correct Name for ${filepath} -> ${filename}`, function () {
        AssetsUtils.pathToName(filepath).should.equal(filename);
      });
    });
  });
  describe('#getThumbPath', function () {
    data.imageThumbTuple.forEach((entry) => {
      const image = entry.image;
      const thumb = entry.thumb;
      const thumbSuffix = entry.thumbSuffix;
      it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
        AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
      });
    });
  });
  describe('#getVideoPosterPath', function () {
    data.videoThumbTuple.forEach((entry) => {
      const video = entry.video;
      const poster = entry.poster;
      const posterSuffix = entry.posterSuffix;
      it(`should return the correct Poster Path for ${video} ${posterSuffix} -> ${poster}`, function () {
        AssetsUtils.getVideoPosterPath(video, posterSuffix).should.equal(poster);
      });
    });
  });
  describe('#extensionByMimetype', function () {
    data.mimetypeTuple.forEach((entry) => {
      const mimeType = entry.mimeType;
      const extension = entry.extension;
      it(`should return the correct extension by mimetype for ${mimeType} -> ${extension}`, function () {
        AssetsUtils.extensionByMimetype(mimeType).should.equal(extension);
      });
    });
  });
  describe('#mimetypeByExtension', function () {
    data.extensionTuple.forEach((entry) => {
      const mimeType = entry.mimeType;
      const extension = entry.extension;
      it(`should return the correct mimetype by extension for ${extension} -> ${mimeType}`, function () {
        AssetsUtils.mimetypeByExtension(extension).should.equal(mimeType);
      });
    });
  });
  describe('#getHash', function () {
    data.sampleFilesTuple.forEach((entry) => {
      const file = entry.path;
      const hash = entry.hash;
      it(`should return hash String for ${file} -> ${hash}`, function () {
        AssetsUtils.getHash(file).then((fileHash) => {
          fileHash.should.equal(hash);
        });
      });
    });
  });
  describe('#getFileSize', function () {
    data.sampleFilesTuple.forEach((entry) => {
      const file = entry.path;
      const size = entry.size;
      it(`should return file size for ${file} -> ${size}`, function () {
        AssetsUtils.getFileSize(file).should.equal(size);
      });
    });
  });
  describe('#removeDir', function () {
    const dirPath = data.tempDir;
    fs.existsSync(dirPath);
    it(`should return true boolean ${dirPath} -> ${true}`, function () {
      AssetsUtils.removeDir(dirPath).then((result) => {
        result.should.equal(true);
      });
    });
  });
  describe('#getMaxThumbSize', function () {
    data.SampleSizeTuple.forEach((entry) => {
      const width = entry.width;
      const height = entry.height;
      const maxThumbWidth = entry.maxThumbWidth;
      const maxThumbHeight = entry.maxThumbHeight;
      const sizeResult = entry.sizeResult;
      const resultWidth = sizeResult.width;
      const resultHeight = sizeResult.height;

      it(`Thumbnail max size with width: ${resultWidth} and height: ${resultHeight}`, function () {
        AssetsUtils.getMaxThumbSize(width, height, maxThumbWidth, maxThumbHeight).should.be.eql(sizeResult);
      });
    });
  });
});