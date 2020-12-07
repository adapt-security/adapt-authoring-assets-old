const should = require('should');
const fs = require('fs-extra');
const AssetsUtils = require('./../lib/assetsUtils');
const data = require('./data/data');
describe('AssetsUtils', function () {
  describe('AssetsUtils.nameToPath', function () {
    data.pathNameTuple.forEach((entry) => {
      const filename = entry.filename;
      const filepath = entry.filepath;
      it(`should return the correct Path for ${filename} -> ${filepath}`, function () {
        AssetsUtils.nameToPath(filename).should.equal(filepath);
      });
    }
    );
  });
  describe('AssetsUtils.pathToName', function () {
    data.pathNameTuple.forEach((entry) => {
      const filename = entry.filename;
      const filepath = entry.filepath;
      it(`should return the correct Name for ${filepath} -> ${filename}`, function () {
        AssetsUtils.pathToName(filepath).should.equal(filename);
      });
    }
    );
  });
  describe('AssetsUtils.getThumbPath', function () {
    data.imageThumbTuple.forEach((entry) => {
      const image = entry.image;
      const thumb = entry.thumb;
      const thumbSuffix = entry.thumbSuffix;
      it(`should return the correct Thumbailname for ${image} ${thumbSuffix} -> ${thumb}`, function () {
        AssetsUtils.getThumbPath(image, thumbSuffix).should.equal(thumb);
      });
    }
    );
  });
  describe('AssetsUtils.getVideoPosterPath', function () {
    data.videoThumbTuple.forEach((entry) => {
      const video = entry.video;
      const poster = entry.poster;
      const posterSuffix = entry.posterSuffix;
      it(`should return the correct Poster Path for ${video} ${posterSuffix} -> ${poster}`, function () {
        AssetsUtils.getVideoPosterPath(video, posterSuffix).should.equal(poster);
      });
    }
    );
  });
  describe('AssetsUtils.extensionByMimetype', function () {
    data.mimetypeTuple.forEach((entry) => {
      const mimeType = entry.mimeType;
      const extension = entry.extension;
      it(`should return the correct extension by mimetype for ${mimeType} -> ${extension}`, function () {
        AssetsUtils.extensionByMimetype(mimeType).should.equal(extension);
      });
    });
  });
  describe('AssetsUtils.mimetypeByExtension', function () {
    data.extensionTuple.forEach((entry) => {
      const mimeType = entry.mimeType;
      const extension = entry.extension;
      it(`should return the correct mimetype by extension for ${extension} -> ${mimeType}`, function () {
        AssetsUtils.mimetypeByExtension(extension).should.equal(mimeType);
      });
    });
  });
  describe('AssetsUtils.getHash', function () {
    data.sampleFilesTuple.forEach((entry) => {
      let file = entry.path;
      let hash = entry.hash;
      it(`should return hash String for ${file} -> ${hash}`, function () {
        AssetsUtils.getHash(file).then((fileHash) => {
          fileHash.should.equal(hash)
        });
      });
    });
  })
  describe('AssetsUtils.getFileSize', function () {
    data.sampleFilesTuple.forEach((entry) => {
      let file = entry.path;
      let size = entry.size;
      it(`should return file size for ${file} -> ${size}`, function () {
        AssetsUtils.getFileSize(file).should.equal(size);
      });
    });
  });
  describe('AssetsUtils.removeDir', function () {
    let dirPath = data.tempDir;
    fs.existsSync(dirPath);
    it(`should return true boolean ${dirPath} -> ${true}`, function () {
      AssetsUtils.removeDir(dirPath).then((result) => {
        result.should.equal(true);
      });
    });
  });
  //TODO:Write test to getMaxThumbSize 
});